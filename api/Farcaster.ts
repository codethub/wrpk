// api/Farcaster.ts

import { VercelRequest, VercelResponse } from '@vercel/node';

interface FarcasterUser {
  fid: number;
  username: string;
  pfp_url: string;
}
type NeynarApiResponse = Record<string, FarcasterUser[]>;


export default async function (req: VercelRequest, res: VercelResponse) {
  const address = req.query.address as string;

  if (!address) {
    return res.status(400).json({ message: 'Address is required' });
  }

  const lowerCaseAddress = address.toLowerCase();

  const NEYNAR_API_KEY = process.env.NEYNAR_API_KEY;
  if (!NEYNAR_API_KEY) {
    return res.status(500).json({ message: 'Server error: Neynar API key not set' });
  }

  const NEYNAR_API_URL = `https://api.neynar.com/v2/farcaster/user/bulk-by-address?addresses=${lowerCaseAddress}`;

  try {
    const response = await fetch(NEYNAR_API_URL, {
      method: 'GET',
      headers: {
        'api_key': NEYNAR_API_KEY,
        'accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Neynar API error: ${response.statusText}`);
    }

    const data = await response.json() as NeynarApiResponse;

    const userList = data[lowerCaseAddress];

    if (!userList || userList.length === 0) {
      return res.status(404).json({ message: 'Farcaster user not found' });
    }

    const user = userList[0];

    return res.status(200).json({
      fid: user.fid,
      username: user.username,
      pfpUrl: user.pfp_url,
    });

  } catch (err) {
    console.error(err);
    const message = (err instanceof Error) ? err.message : 'Internal Server Error';
    return res.status(500).json({ message, error: message });
  }
}