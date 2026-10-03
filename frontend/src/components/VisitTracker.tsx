import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { trackDailyVisit } from "../utils/track";

// Compte une visite par jour et par navigateur (les administrateurs ne sont pas comptés)
function VisitTracker() {
  const { role } = useAuth();
  useEffect(() => {
    if (role !== "admin") trackDailyVisit();
  }, [role]);
  return null;
}

export default VisitTracker;
