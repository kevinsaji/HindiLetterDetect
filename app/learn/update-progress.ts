import { NextApiRequest, NextApiResponse } from 'next'
import fs from 'fs'
import path from 'path'

// Define the type for a user
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

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow POST method
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }
  try {
    const { email, completedLetters, mistakes } = req.body

    if (!email || !completedLetters || !Array.isArray(completedLetters) || !mistakes) {
      return res.status(400).json({ error: 'Missing or invalid required parameters' })
    }

    // Read the current user data
    const filePath = path.join(process.cwd(), 'data', 'UserDetails.json')
    const fileData = fs.readFileSync(filePath, 'utf8')
    const users: User[] = JSON.parse(fileData)

    // Find the user by email
    const userIndex = users.findIndex(user => user.user_email === email)
    if (userIndex === -1) {
      return res.status(404).json({ error: 'User not found' })
    }

    // Update the user's completed letters
    users[userIndex].letters_completed = completedLetters
    users[userIndex].mistakes = mistakes

    // Write the updated data back to the file
    fs.writeFileSync(filePath, JSON.stringify(users, null, 2))

    return res.status(200).json({ success: true })
  } catch (error) {
    console.error('Error updating user progress:', error)
    return res.status(500).json({ error: 'Failed to update user progress' })
  }
}