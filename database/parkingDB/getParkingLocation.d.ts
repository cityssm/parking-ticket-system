import sqlite from 'better-sqlite3';
import type { ParkingLocation } from '../../types/recordTypes.js';
export default function getParkingLocation(locationKey: string, connectedDatabase?: sqlite.Database): ParkingLocation;
