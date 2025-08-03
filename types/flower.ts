export interface Flower {
    id: string;
    common_name?: string;
    scientific_name?: string;
    cycle?: string;
    watering?: string;
    sunlight?: string | string[];
    hardiness?: { min: number; max: number };
    flowering_season?: string;
    description?: string;
    default_image?: { thumbnail: string; medium_url: string };
}

export interface PlantableFlower extends Flower{
    color?: string;
}

export type FlowerForm = {
    id: string;
    common_name: string;
    scientific_name: string;
    cycle: string;
    watering: string;
    sunlight: string;
    flowering_season: string;
    description: string;
    hardinessMin: string;
    hardinessMax: string;
    localImageUri: string | null;
};