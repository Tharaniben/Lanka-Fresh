package com.lankafresh.backend.deliverymanagement.repository;

import com.lankafresh.backend.deliverymanagement.model.Delivery;
import com.lankafresh.backend.deliverymanagement.model.DeliveryAssignment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface DeliveryAssignmentRepository extends JpaRepository<DeliveryAssignment, Long> {

    Optional<DeliveryAssignment> findByDeliveryAndActiveTrue(Delivery delivery);

    List<DeliveryAssignment> findByAgentUserIdAndActiveTrue(Long agentUserId);

    List<DeliveryAssignment> findByDelivery(Delivery delivery);
}
