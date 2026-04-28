import { useSelector } from "react-redux";
import { selectCompanyTags } from "../redux/slices/companySlice";

export const DEFAULT_TAG_OPTIONS = [
  "Interested",
  "Most Interested",
  "Least Interested",
  "Not Interested",
  "Not Picking Call",
  "Number Busy",
  "Invalid Phone Number",
  "Invalid Whatsapp Number",
  "Will Tell Later",
  "Next Year",
  "India Enquiry",
  "Junk",
];

// Returns company-defined tags when available, falls back to defaults.
export const useTagOptions = (): string[] => {
  const companyTags = useSelector(selectCompanyTags);
  return companyTags.length > 0 ? companyTags : DEFAULT_TAG_OPTIONS;
};
