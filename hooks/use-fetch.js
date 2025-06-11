import { useState } from "react";
import { toast } from "sonner"; // for showing error messages

const useFetch = (cb) => {
  const [data, setData] = useState(undefined); // API result
  const [loading, setLoading] = useState(null); // loading status
  const [error, setError] = useState(null); // error if any

  const fn = async (...args) => {
    setLoading(true);
    setError(null);

    try {
      const response = await cb(...args); // API call
      setData(response);
      setError(null);
    } catch (error) {
      setError(error);
      toast.error(error.message); // show error toast
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, fn, setData };
};

export default useFetch;
