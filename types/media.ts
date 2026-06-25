export interface MediaItem {
    id: number;
    title?: string;
    name?: string;
    poster_path: string | null;
    vote_average?: number;
    release_date?: string;
    first_air_date?: string;
}
