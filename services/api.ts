export const PERENUAL_CONFIG = {
    BASE_URL: "https://perenual.com/api/v2",
    API_KEY: process.env.EXPO_PUBLIC_PERENUAL_API_KEY!,
};

export interface BaseFlower {
    id:                 number;
    common_name?:       string;
    scientific_name?:   string;
    default_image?: {
        medium_url?:    string;
        thumbnail?:     string;
    };
}

export interface FlowerDetail {
    common_name?:       string;
    scientific_name?:   string;
    default_image?: {
        medium_url?:    string;
        thumbnail?:     string;
    };
    cycle?:             string;
    watering?:          string;
    sunlight?:          string[];
    hardiness?: {min?: number, max?: number};
    flowering_season?:  string;
    description?:       string;
}

export async function fetchFlowerList(
    query: string,
    page = 1,
    perPage = 30
): Promise<BaseFlower[]> {
    const params = new URLSearchParams({
        key: PERENUAL_CONFIG.API_KEY,
        ...(query.trim() && { q: query }),
        page:      page.toString(),
        per_page:  perPage.toString(),
    }).toString();

    const url = `${PERENUAL_CONFIG.BASE_URL}/species-list?${params}`;

    const res = await fetch(url);
    if (!res.ok) {
        throw new Error(`Perennial list fetch failed: ${res.statusText}`);
    }

    const json = await res.json() as {
        data: Array<{
            id:                 number;
            common_name:        string;
            scientific_name?:   string;
            default_image?: {
                thumbnail?:     string;
                medium_url?:    string;
            } | null;
        }>;
    };

    return json.data.map(item => ({
        id:             item.id,
        common_name:    item.common_name ?? "Unknown species",
        scientific_name: item.scientific_name ?? "",
        default_image:  item.default_image
            ? {
                thumbnail:  item.default_image.thumbnail ?? "",
                medium_url: item.default_image.medium_url ?? "",
              }
            : undefined,
    }));
}

/**
 * Fetch the full details for one species by ID.
 */
export async function fetchFlowerDetails(
    id: number
): Promise<FlowerDetail> {
    const url = `${PERENUAL_CONFIG.BASE_URL}/species/details/${id}?key=${PERENUAL_CONFIG.API_KEY}`;

    const res = await fetch(url);
    if (!res.ok) {
        throw new Error(`Perennial detail fetch failed: ${res.statusText}`);
    }

    const json = await res.json() as Partial<FlowerDetail> & {
        common_name?:       string;
        scientific_name?:   string;
        default_image?:     { thumbnail?: string; medium_url?: string; };
        cycle?:             string;
        watering?:          string;
        sunlight?:          string[];
        hardiness?:         { min?: number, max?: number };
        flowering_season?:  string;
        description?:       string;
    };

    return {
        common_name:     json.common_name ?? "Unknown species",
        scientific_name: json.scientific_name ?? "",
        default_image:   json.default_image
            ? {
                thumbnail:  json.default_image.thumbnail  ?? "",
                medium_url: json.default_image.medium_url ?? "",
            }
            : undefined,
        cycle:            json.cycle            ?? "Unknown cycle",
        watering:         json.watering         ?? "Unknown watering",
        sunlight:         json.sunlight         ?? [],
        flowering_season: json.flowering_season ?? "Unknown season",
        hardiness:        {
            min:        json.hardiness?.min ?? 0,
            max:        json.hardiness?.max ?? 0,
        },
        description:    json.description      ?? "",
    };
}
