import { redirect } from "next/navigation";

/** /admin is not a page. Anonymous visitors are sent to the login by
 *  `proxy.ts` before this runs; everyone else wants the post list. */
export default function AdminIndex() {
  redirect("/admin/posts");
}
