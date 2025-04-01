import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
console.log("s1");
const userDetailsPath = path.join(process.cwd(), "app/auth/UserDetails.json");
console.log("s2");
export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    const users = JSON.parse(fs.readFileSync(userDetailsPath, "utf-8"));
    console.log("s3");
    let user = users.find((u: any) => u.user_email === email);
    const currentDate = new Date().toISOString().split("T")[0];
    
    if (user) {
      const lastLoginDate = user.last_login_date.split("T")[0];

      if (lastLoginDate !== currentDate) {
        user.login_streak =
          lastLoginDate === new Date(new Date().setDate(new Date().getDate() - 1)).toISOString().split("T")[0]
            ? user.login_streak + 1
            : 1;

        user.longest_login_streak = Math.max(user.longest_login_streak, user.login_streak);
      }

      user.last_login_date = new Date().toISOString();
      fs.writeFileSync(userDetailsPath, JSON.stringify(users, null, 2));

      return NextResponse.json({ success: true, user });
    }

    return NextResponse.json({ success: false, message: "Invalid email or password" }, { status: 400 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: "Error processing request" }, { status: 500 });
  }
}
