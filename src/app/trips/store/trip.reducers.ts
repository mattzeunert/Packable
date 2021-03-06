import * as TripActions from './trip.actions';
import { Trip } from '../../shared/models/trip.model';
import { PackingList } from '../../shared/models/packing-list.model';

export interface State {
    trips: Trip[];
    packingLists: PackingList[];
}

const initialState: State = {
    trips: [],
    packingLists: []
}
export function tripReducers(state = initialState, action: TripActions.tripActions) {
    switch (action.type) {
        case TripActions.SET_TRIP_STATE:
        console.log(action.payload)
            return {
                ...state,
                ...action.payload
            }
        case TripActions.ADD_TRIP:
            return {
                ...state,
                trips: [...state.trips, action.payload]
            }
        case TripActions.EDIT_TRIP:
            const editId = action.payload.id;
            const editIndex = state.trips.findIndex(p=>p.id === editId);
            const trip = state.trips[editIndex];
            const updatedTrip = {
                ...trip,
                ...action.payload
            }
            const updatedTrips = state.trips.slice();
            updatedTrips[editIndex] = updatedTrip;
            return {
                ...state,
                trips: [...updatedTrips]
            }
        case TripActions.REMOVE_TRIP:
            let removeId = action.payload;
            let removeIndex = state.trips.findIndex(p=>p.id == removeId)
            const removeTrips = state.trips.slice();
            removeTrips.splice(removeIndex,1);
            return {
                ...state,
                trips: [...removeTrips]
            }
        case TripActions.REMOVE_TRIP_PROFILE:
            const rp_id = action.payload
            const rp_trips = state.trips.slice()
            rp_trips.map(trip=>{
                trip.profiles = trip.profiles.filter(p=> p!=rp_id)
                return trip
            })
            return {
                ...state,
                trips: rp_trips
            }
        case TripActions.REMOVE_TRIP_ACTIVITY:
            const ra_id = action.payload
            const ra_trips = state.trips.slice()
            ra_trips.map(trip =>{
                trip.activities = trip.activities.filter(a=>a!=ra_id)
                return trip
            })
            return {
                ...state,
                trips: ra_trips
            }
        case TripActions.UPDATE_PACKING_LIST:
            const newList = action.payload;
            const updateListIndex = state.packingLists.findIndex(p=>p.tripId === newList.tripId);
            if(updateListIndex > -1){
                let newListState = state.packingLists.slice();
                newListState[updateListIndex] = newList;
                return{
                    ...state,
                    packingLists: newListState
                }
            } else {
                return {
                    ...state,
                    packingLists: [...state.packingLists, newList]
                }
            }
        default:
            return state;
        }
}