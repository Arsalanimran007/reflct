// Force dynamic rendering for the page
export const dynamic = "force-dynamic"; 

import { getCollections } from "@/actions/collection";
import { getJournalEntries } from "@/actions/journal";
import MoodAnalytics from "./_components/mood-analytics";
import Collections from "./_components/collections";

const Dashboard = async () => {
  // Fetching dynamic data on the server side (this is a Server Component)
  const collections = await getCollections();
  const entriesData = await getJournalEntries();

  // Group entries by collection
  const entriesByCollection = entriesData?.data?.entries?.reduce(
    (acc, entry) => {
      const collectionId = entry.collectionId || "unorganized";
      if (!acc[collectionId]) {
        acc[collectionId] = [];
      }
      acc[collectionId].push(entry);
      return acc;
    },
    {}
  );

  return (
    <div className="px-4 py-8 space-y-8">
      {/* Analytics Section */}
      <section className="space-y-4">
        <MoodAnalytics />
      </section>

      {/* Collections Section */}
      <Collections
        collections={collections}
        entriesByCollection={entriesByCollection}
      />
    </div>
  );
};

export default Dashboard;
