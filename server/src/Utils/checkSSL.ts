import sslChecker from "ssl-checker";

const getSslDetails = async (hostname: string) => {
  let fixedUrl = hostname.replace(/^(?:https?:\/\/)?(?:www\.)?/i, "").split('/')[0]
  console.log("fixedUrl: ", fixedUrl);
  return await sslChecker(fixedUrl);
}

export default getSslDetails;