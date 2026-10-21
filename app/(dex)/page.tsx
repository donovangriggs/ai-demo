import { EmptyPane } from "@/components/EmptyPane";
import { RandomSpeciesPick } from "@/components/RandomSpeciesPick";
import { getPokedex } from "@/lib/pokeapi";

export default async function Home() {
  return (
    <>
      <EmptyPane />
      <RandomSpeciesPick species={await getPokedex()} />
    </>
  );
}
