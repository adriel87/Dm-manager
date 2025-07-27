import { getCollection } from '@/lib/mongo';
import { NextRequest, NextResponse } from 'next/server';

// Simulación de campañas (reemplaza esto con tu lógica de base de datos)
const campaigns = [
    { id: 1, name: 'Campaña A', status: 'activa' },
    { id: 2, name: 'Campaña B', status: 'inactiva' },
];

export async function GET(req: NextRequest) {


    const collection = await getCollection('campaigns');
    const campaignsList  = await collection.find({}).toArray();
    

    return NextResponse.json(campaignsList);
}