import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const userDetailsPath = path.join(process.cwd(), "app/auth/UserDetails.json");

export async function POST(req: Request) {
  try {
    const { username, email, password } = await req.json();

    const users = JSON.parse(fs.readFileSync(userDetailsPath, "utf-8"));

    // Check if user already exists
    if (users.some((user: any) => user.user_email === email)) {
      return NextResponse.json({ success: false, message: "User already exists" }, { status: 400 });
    }

    // Create new user
    const newUser = {
      username,
      user_email: email,
      user_password: password,
      letters_completed: [],
      last_login_date: new Date().toISOString(),
      login_streak: 1,
      longest_login_streak: 1,
    };

    users.push(newUser);

    fs.writeFileSync(userDetailsPath, JSON.stringify(users, null, 2));

    return NextResponse.json({ success: true, user: newUser });
  } catch (error) {
    console.error("Signup Error:", error);
    return NextResponse.json({ success: false, message: "Error processing signup request" }, { status: 500 });
  }
}
