import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { useUserStore } from "@/lib/store";

interface User {
  username: string;
  user_email: string;
  user_password: string;
  letters_completed: string[];
  last_login_date: string;
  login_streak: number;
  longest_login_streak: number;
  mistakes: number;
}

export async function POST(req: Request) {
  try {
    const { email, completedLetters, mistakes } = await req.json();

    if (!email || !completedLetters || !Array.isArray(completedLetters) || !mistakes) {
      return NextResponse.json({ error: 'Missing or invalid required parameters' }, { status: 400 });
    }

    // Read the current user data
    //const filePath = path.join(process.cwd(), 'data', 'UserDetails.json');
    const filePath = "app/auth/UserDetails.json"; 
    const fileData = fs.readFileSync(filePath, 'utf8');
    const users: User[] = JSON.parse(fileData);
        
    // Find the user by email
    const userIndex = users.findIndex(user => user.user_email === email);
    if (userIndex === -1) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Update the user's completed letters
    users[userIndex].letters_completed = completedLetters;
    users[userIndex].mistakes = mistakes;
    // Write the updated data back to the file
    fs.writeFileSync(filePath, JSON.stringify(users, null, 2));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating user progress:', error);
    return NextResponse.json({ error: 'Failed to update user progress' }, { status: 500 });
  }
}