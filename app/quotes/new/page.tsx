import NewQuoteClient from './NewQuoteClient';

export default function Page({ searchParams }: { searchParams?: { load?: string } }) {
  return <NewQuoteClient loadId={searchParams?.load} />;
}
