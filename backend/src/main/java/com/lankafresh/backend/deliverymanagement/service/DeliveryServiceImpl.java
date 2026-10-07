package com.lankafresh.backend.deliverymanagement.service;

import com.lankafresh.backend.deliverymanagement.dto.DeliveryAssignmentResponseDto;
import com.lankafresh.backend.deliverymanagement.dto.DeliveryResponseDto;
import com.lankafresh.backend.deliverymanagement.model.Delivery;
import com.lankafresh.backend.deliverymanagement.model.DeliveryAssignment;
import com.lankafresh.backend.deliverymanagement.model.DeliveryStatus;
import com.lankafresh.backend.deliverymanagement.repository.DeliveryAssignmentRepository;
import com.lankafresh.backend.deliverymanagement.repository.DeliveryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.EnumMap;
import java.util.EnumSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class DeliveryServiceImpl implements DeliveryService {

    private final DeliveryRepository deliveryRepository;
    private final DeliveryAssignmentRepository assignmentRepository;
    private final MockDeliveryLocationService locationService;

    // Valid forward transitions in the lifecycle from PRD 5.4:
    // ORDER_PLACED -> ASSIGNED -> OUT_FOR_DELIVERY -> DELIVERED
    // CANCELLED is reachable from any state except DELIVERED.
    private static final Map<DeliveryStatus, Set<DeliveryStatus>> ALLOWED_TRANSITIONS = new EnumMap<>(DeliveryStatus.class);
    static {
        ALLOWED_TRANSITIONS.put(DeliveryStatus.ORDER_PLACED, EnumSet.of(DeliveryStatus.ASSIGNED, DeliveryStatus.CANCELLED));
        ALLOWED_TRANSITIONS.put(DeliveryStatus.ASSIGNED, EnumSet.of(DeliveryStatus.OUT_FOR_DELIVERY, DeliveryStatus.CANCELLED));
        ALLOWED_TRANSITIONS.put(DeliveryStatus.OUT_FOR_DELIVERY, EnumSet.of(DeliveryStatus.DELIVERED, DeliveryStatus.CANCELLED));
        ALLOWED_TRANSITIONS.put(DeliveryStatus.DELIVERED, EnumSet.noneOf(DeliveryStatus.class));
        ALLOWED_TRANSITIONS.put(DeliveryStatus.CANCELLED, EnumSet.noneOf(DeliveryStatus.class));
    }

    public DeliveryServiceImpl(DeliveryRepository deliveryRepository,
                                DeliveryAssignmentRepository assignmentRepository,
                                MockDeliveryLocationService locationService) {
        this.deliveryRepository = deliveryRepository;
        this.assignmentRepository = assignmentRepository;
        this.locationService = locationService;
    }

    @Override
    @Transactional
    public DeliveryResponseDto createDeliveryForOrder(Long orderId, String deliveryAddress) {
        deliveryRepository.findByOrderId(orderId).ifPresent(existing -> {
            throw new IllegalStateException("Delivery already exists for order " + orderId);
        });

        Delivery delivery = new Delivery(orderId, deliveryAddress);
        double[] start = locationService.initialCoordinates();
        delivery.setCurrentLatitude(start[0]);
        delivery.setCurrentLongitude(start[1]);

        Delivery saved = deliveryRepository.save(delivery);
        return toDto(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<DeliveryResponseDto> getAllDeliveries() {
        return deliveryRepository.findAll()
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<DeliveryResponseDto> getUnassignedDeliveries() {
        return deliveryRepository.findByStatusOrderByCreatedAtAsc(DeliveryStatus.ORDER_PLACED)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<DeliveryResponseDto> getDeliveriesAssignedToAgent(Long agentUserId) {
        return assignmentRepository.findByAgentUserIdAndActiveTrue(agentUserId)
                .stream()
                .map(DeliveryAssignment::getDelivery)
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public DeliveryResponseDto getDeliveryById(Long deliveryId) {
        Delivery delivery = findDeliveryOrThrow(deliveryId);
        return toDto(delivery);
    }

    @Override
    @Transactional(readOnly = true)
    public DeliveryResponseDto getDeliveryByOrderId(Long orderId) {
        Delivery delivery = deliveryRepository.findByOrderId(orderId)
                .orElseThrow(() -> new IllegalArgumentException("No delivery found for order " + orderId));
        return toDto(delivery);
    }

    @Override
    @Transactional
    public DeliveryAssignmentResponseDto assignDelivery(Long deliveryId, Long agentUserId) {
        Delivery delivery = findDeliveryOrThrow(deliveryId);
        DeliveryStatus status = delivery.getStatus();

        // First assignment (from the Unassigned tab): ORDER_PLACED -> ASSIGNED.
        // Reassignment (from the All Deliveries tab, per the team's RBAC
        // plan): already ASSIGNED -> cancel the current active assignment,
        // create a new one, delivery stays ASSIGNED. Once a driver has
        // picked up (OUT_FOR_DELIVERY) or later, reassigning here doesn't
        // make sense — that's a dispatch-level change, not a CRUD action
        // this module should silently allow.
        if (status != DeliveryStatus.ORDER_PLACED && status != DeliveryStatus.ASSIGNED) {
            throw new IllegalStateException(
                    "Delivery " + deliveryId + " cannot be (re)assigned from status " + status);
        }

        List<DeliveryAssignment> activeAssignments = assignmentRepository.findByDeliveryAndActiveTrue(delivery);
        for (DeliveryAssignment existing : activeAssignments) {
            existing.cancel();
            assignmentRepository.save(existing);
        }

        DeliveryAssignment assignment = new DeliveryAssignment(delivery, agentUserId);
        DeliveryAssignment saved = assignmentRepository.save(assignment);

        delivery.setStatus(DeliveryStatus.ASSIGNED);
        deliveryRepository.save(delivery);

        return toDto(saved);
    }

    @Override
    @Transactional
    public DeliveryResponseDto updateDeliveryStatus(Long deliveryId, DeliveryStatus newStatus) {
        Delivery delivery = findDeliveryOrThrow(deliveryId);
        DeliveryStatus current = delivery.getStatus();

        Set<DeliveryStatus> allowed = ALLOWED_TRANSITIONS.getOrDefault(current, EnumSet.noneOf(DeliveryStatus.class));
        if (!allowed.contains(newStatus)) {
            throw new IllegalStateException(
                    "Cannot move delivery " + deliveryId + " from " + current + " to " + newStatus);
        }

        delivery.setStatus(newStatus);

        // Step the simulated driver location closer to the destination on
        // OUT_FOR_DELIVERY updates — mocked tracking per PRD 4.8.
        if (newStatus == DeliveryStatus.OUT_FOR_DELIVERY
                && delivery.getDestinationLatitude() != null
                && delivery.getDestinationLongitude() != null) {
            double[] next = locationService.stepToward(
                    delivery.getCurrentLatitude(), delivery.getCurrentLongitude(),
                    delivery.getDestinationLatitude(), delivery.getDestinationLongitude());
            delivery.setCurrentLatitude(next[0]);
            delivery.setCurrentLongitude(next[1]);
        }

        Delivery saved = deliveryRepository.save(delivery);
        return toDto(saved);
    }

    @Override
    @Transactional
    public void cancelAssignment(Long deliveryId) {
        Delivery delivery = findDeliveryOrThrow(deliveryId);
        assignmentRepository.findByDeliveryAndActiveTrue(delivery)
                .forEach(assignmentRepository::delete);

        // This is the module's "Delete" — on DeliveryAssignment, not on
        // Delivery. Send the delivery back to ORDER_PLACED so it reappears
        // in "Unassigned" rather than being stuck in ASSIGNED with no
        // active agent. Delivery itself is never deleted (PRD 5.4: "no
        // Delete" on Delivery).
        if (delivery.getStatus() == DeliveryStatus.ASSIGNED) {
            delivery.setStatus(DeliveryStatus.ORDER_PLACED);
            deliveryRepository.save(delivery);
        }
    }

    @Override
    @Transactional
    public DeliveryResponseDto updateDeliveryAddress(Long deliveryId, String newAddress) {
        Delivery delivery = findDeliveryOrThrow(deliveryId);
        delivery.setDeliveryAddress(newAddress);
        Delivery saved = deliveryRepository.save(delivery);
        return toDto(saved);
    }

    // --- helpers ---

    private Delivery findDeliveryOrThrow(Long deliveryId) {
        return deliveryRepository.findById(deliveryId)
                .orElseThrow(() -> new IllegalArgumentException("Delivery not found: " + deliveryId));
    }

    private DeliveryResponseDto toDto(Delivery delivery) {
        Long assignedAgentId = assignmentRepository.findFirstByDeliveryAndActiveTrueOrderByIdDesc(delivery)
                .map(DeliveryAssignment::getAgentUserId)
                .orElse(null);

        return new DeliveryResponseDto(
                delivery.getId(),
                delivery.getOrderId(),
                delivery.getDeliveryAddress(),
                delivery.getStatus(),
                assignedAgentId,
                delivery.getCurrentLatitude(),
                delivery.getCurrentLongitude(),
                delivery.getDestinationLatitude(),
                delivery.getDestinationLongitude(),
                delivery.getCreatedAt(),
                delivery.getUpdatedAt()
        );
    }

    private DeliveryAssignmentResponseDto toDto(DeliveryAssignment assignment) {
        return new DeliveryAssignmentResponseDto(
                assignment.getId(),
                assignment.getDelivery().getId(),
                assignment.getAgentUserId(),
                assignment.getAssignedAt(),
                assignment.getCancelledAt(),
                assignment.isActive()
        );
    }
}
