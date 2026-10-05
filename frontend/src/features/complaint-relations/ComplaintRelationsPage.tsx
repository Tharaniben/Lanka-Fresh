import { useState } from "react";
import { useUserRole } from "../../auth/useUserRole";
import ComplaintForm from "./ComplaintForm";
import MyComplaints from "./MyComplaints";
import FeedbackForm from "./FeedbackForm";
import FeedbackList from "./FeedbackList";
import ComplaintQueue from "./ComplaintQueue";
import "./ComplaintRelationsPage.css";

type CustomerTab = "submit" | "history" | "feedback";
type StaffTab = "complaints" | "feedback";

export default function ComplaintRelationsPage() {
  const { role, loading } = useUserRole();
  const [tab, setTab] = useState<CustomerTab>("submit");
  const [staffTab, setStaffTab] = useState<StaffTab>("complaints");
  const [trackedComplaintId, setTrackedComplaintId] = useState<number | null>(null);

  if (loading) {
    return <p className="complaint-relations-page__status">Loading…</p>;
  }

  const isStaff = role === "CRO" || role === "BRANCH_MANAGER";

  if (isStaff) {
    return (
      <div className="complaint-relations-page">
        <h1 className="complaint-relations-page__heading">Complaints & Customer Relations</h1>

        <div className="complaint-relations-page__tabs">
          <button
            className={staffTab === "complaints" ? "complaint-relations-page__tab--active" : ""}
            onClick={() => setStaffTab("complaints")}
          >
            Complaints Queue
          </button>
          <button
            className={staffTab === "feedback" ? "complaint-relations-page__tab--active" : ""}
            onClick={() => setStaffTab("feedback")}
          >
            Customer Feedback
          </button>
        </div>

        <div className="complaint-relations-page__content">
          {staffTab === "complaints" && <ComplaintQueue />}
          {staffTab === "feedback" && <FeedbackList />}
        </div>
      </div>
    );
  }

  return (
    <div className="complaint-relations-page">
      <h1 className="complaint-relations-page__heading">Complaints & Feedback</h1>

      <div className="complaint-relations-page__tabs">
        <button
          className={tab === "submit" ? "complaint-relations-page__tab--active" : ""}
          onClick={() => setTab("submit")}
        >
          Raise a complaint
        </button>
        <button
          className={tab === "history" ? "complaint-relations-page__tab--active" : ""}
          onClick={() => setTab("history")}
        >
          Track my complaints
        </button>
        <button
          className={tab === "feedback" ? "complaint-relations-page__tab--active" : ""}
          onClick={() => setTab("feedback")}
        >
          Give feedback
        </button>
      </div>

      <div className="complaint-relations-page__content">
        {tab === "submit" && (
          <ComplaintForm
            onSubmitted={(created) => {
              setTrackedComplaintId(created.id);
              setTab("history");
            }}
          />
        )}
        {tab === "history" && <MyComplaints initialComplaintId={trackedComplaintId} />}
        {tab === "feedback" && <FeedbackForm />}
      </div>
    </div>
  );
}
