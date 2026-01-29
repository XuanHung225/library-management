import { useState, useEffect } from "react";
import loanService from "../services/loan.service";

const useLoans = (userId) => {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    loanService
      .getLoansByUser(userId)
      .then((data) => setLoans(data))
      .finally(() => setLoading(false));
  }, [userId]);

  return { loans, loading };
};

export default useLoans;
