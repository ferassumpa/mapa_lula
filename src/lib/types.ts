export type StateRow = {
  uf: string;
  name: string;
  slug: string;
};

export type Manifestation = {
  id: string;
  state_uf: string;
  title: string;
  description: string | null;
  youtube_id: string;
  city: string | null;
  occurred_at: string | null;
  source_url: string | null;
  created_at: string;
};

export type StateWithCount = StateRow & {
  count: number;
};
