import React from "react";
import { useAppSelector } from "@/store/hooks";

export const Dashboard: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);

  return (
    <div>
      <h2>Welcome to your Dashboard</h2>
      <div style={{ marginTop: "2rem" }}>
        <h3>Your Profile</h3>
        <div
          style={{
            marginTop: "1rem",
            background: "#f5f5f5",
            padding: "1.5rem",
            borderRadius: "8px",
          }}
        >
          <p>
            <strong>Name:</strong> {user?.firstName} {user?.lastName}
          </p>
          <p>
            <strong>Email:</strong> {user?.email}
          </p>
          <p>
            <strong>Role:</strong> {user?.role}
          </p>
        </div>
      </div>
    </div>
  );
};
