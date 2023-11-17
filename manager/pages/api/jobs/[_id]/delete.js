/* * */

import delay from '@/services/delay';
import QUEUEDB from '@/services/QUEUEDB';
import { authOptions } from 'pages/api/auth/[...nextauth]';
import { getServerSession } from 'next-auth/next';

/* * */

export default async function handler(req, res) {
  //
  await delay();

  // 0.
  // Refuse request if not DELETE

  if (req.method != 'DELETE') {
    await res.setHeader('Allow', ['DELETE']);
    return await res.status(405).json({ message: `Method ${req.method} Not Allowed.` });
  }

  // 1.
  // Check for correct Authentication and valid Permissions

  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.email?.length) throw new Error('You must be logged in to access this feature.');
  } catch (err) {
    console.log(err);
    return await res.status(401).json({ message: err.message || 'Could not verify Authentication.' });
  }

  // 2.
  // Connect to MongoDB

  try {
    await QUEUEDB.connect();
  } catch (err) {
    console.log(err);
    return await res.status(500).json({ message: 'MongoDB connection error.' });
  }

  // 3.
  // List all documents

  try {
    const result = await QUEUEDB.Job.findOneAndDelete({ _id: QUEUEDB.toObjectId(req.query._id) });
    return await res.status(200).send(result);
  } catch (err) {
    console.log(err);
    return await res.status(500).json({ message: 'Cannot delete Job.' });
  }

  //
}
