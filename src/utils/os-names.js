const OSapiKey = process.env.REACT_APP_OS_API_KEY;
const OSNamesServiceBase = "https://api.os.uk/search/names/v1/find";

export const getOSNames = async (query) => {
  const url =
    OSNamesServiceBase +
    "?maxresults=15" +
    "&bounds=87406,8514,655208,659966" +
    "&key=" +
    OSapiKey +
    "&query=" +
    query;
  const response = await fetch(url);
  return await response.json();
};
