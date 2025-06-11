import axios from "axios";

export const fetchJobListings = async (query = "remote") => {
  const app_id = "ffec525b";
  const app_key = "a1d6d5389f23a7ffaaf5c1b7f24333f2";
  const url = `https://api.adzuna.com/v1/api/jobs/gb/search/1`;

  try {
    const res = await axios.get(url, {
      params: {
        app_id,
        app_key,
        what: query,
        where: "United Kingdom",
        results_per_page: 10,
        content_type: "application/json",
      },
    });

    return res.data.results.map((job) => ({
      title: job.title,
      company: job.company.display_name,
      location: job.location.display_name,
      url: job.redirect_url,
      description: job.description,
    }));
  } catch (error) {
    console.error("Job fetch error:", error.message);
    return [];
  }
};
