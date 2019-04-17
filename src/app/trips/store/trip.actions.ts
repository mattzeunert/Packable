import { Action } from '@ngrx/store';
import { Trip } from '../../shared/models/trip.model';
import { PackingList } from '../../shared/models/packing-list.model';

export const UPDATE_TRIP = 'UPDATE_TRIP';
export const REMOVE_TRIP = 'REMOVE_TRIP';
export const UPDATE_INCOMPLETE = 'UPDATE_INCOMPLETE';
export const REMOVE_INCOMPLETE = 'REMOVE_INCOMPLETE';

export const UPDATE_PACKING_LIST = 'UPDATE_PACKING_LIST';
export const SET_TRIP_STATE = 'SET_TRIP_STATE';

export class setTripState  implements Action{
    readonly type = SET_TRIP_STATE;
    constructor(public payload: {
        trips:Trip[], 
        incomplete: Trip[],
        packingLists: PackingList[]
    }){};
}
export class updateTrips  implements Action{
    readonly type = UPDATE_TRIP;
    constructor(public payload: Trip[]){};
}
export class updateIncomplete  implements Action{
    readonly type = UPDATE_INCOMPLETE;
    constructor(public payload: Trip[]){};
}
export class removeTrips  implements Action{
    readonly type = REMOVE_TRIP;
    constructor(public payload: string[]){};
}
export class removeIncomplete  implements Action{
    readonly type = REMOVE_INCOMPLETE;
    constructor(public payload: string[]){};
}

export class updatePackingList  implements Action{
    readonly type = UPDATE_PACKING_LIST;
    constructor(public payload: PackingList){};
}

export type tripActions = setTripState | updateTrips | updateIncomplete | removeTrips | removeIncomplete | updatePackingList;