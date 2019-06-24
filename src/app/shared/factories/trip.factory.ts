
import { Injectable } from '@angular/core';
import { Trip, displayTrip } from '../models/trip.model';
import * as moment from 'moment'
import { DestinationDataService } from '../services/location-data.service';
import { StoreSelectorService } from '../services/store-selector.service';
import { isDefined } from '../global-functions';
import { TripWeatherData } from '../services/weather.service';
import { tempC } from '../models/weather.model';
import { PackingListPackable, DisplayPackingList as DisplayPackingList, pass, listCollection } from '../models/packing-list.model';
import { ColorGeneratorService } from '../services/color-gen.service';
import { Avatar } from '../models/profile.model';

export const SHARED = 'shared'
export type tripProperties = keyof Trip
@Injectable()
export class TripFactory {
    constructor(
        private destServices: DestinationDataService,
        private storeSelector: StoreSelectorService,
        private colorGen: ColorGeneratorService,

    ) { }
    public duplicateTrip = (trip: Trip): Trip => {
        let newTrip = new Trip(
            trip.id,
            trip.startDate,
            trip.endDate,
            trip.destinationId,
            trip.profiles ? trip.profiles.slice() : [],
            trip.collections ? trip.collections.slice() : [],
            trip.dateModified
        )
        newTrip.collections.forEach(c => {
            if (!isDefined(c.profiles)) {
                c['profiles'] = [];
            }
        })
        return newTrip
    }
    public makeDisplayTrip = (trip: Trip, weatherData?: TripWeatherData): displayTrip => {
        let destination = this.destServices.findDestination(trip.destinationId)
        let dates: string = this.tripDatesToDateString(trip)
        let profiles: string[] = this.storeSelector.profiles
            .filter(p => trip.profiles.includes(p.id))
            .map(p => p.name);
        let collections: string[] = this.storeSelector.originalCollections
            .filter(c => trip.collections.idIndex(c.id) > -1)
            .map(c => c.name);
        return new displayTrip(
            trip.id,
            dates,
            trip.startDate,
            weatherData ? weatherData.tempToHtmlString() : 'TBC',
            destination.fullName,
            profiles,
            collections,
            trip.dateModified
        )
    }

    public tripDatesToDateString = (trip: Trip): string => {
        let startDate = moment(trip.startDate)
        let endDate = moment(trip.endDate)
        if (startDate.month != endDate.month) {
            return `${startDate.format('D MMM')} - ${endDate.format('D MMM')}`
        } else {
            return `${startDate.date()} - ${endDate.format('D MMMM')}`
        }
    }

    public validateTrip = (trip: Trip): tripProperties[] => {
        let validArray: tripProperties[] = []
        let id = trip.destinationId
        let destisValid = !!this.destServices.findDestination(id)
        destisValid && validArray.push('destinationId')
        let now = moment()
        let startDate = moment(trip.startDate)
        let startDateIsFuture = startDate.year() >= now.year() && startDate.dayOfYear() >= now.dayOfYear()
        startDateIsFuture && validArray.push('startDate')
        let endDateIsAfterStart = moment(trip.endDate).isAfter(startDate)
        endDateIsAfterStart && validArray.push('endDate')
        trip.profiles.length > 0 && validArray.push('profiles')
        if (trip.collections.length > 0 && trip.profiles.every(pid => trip.collections.some(c => c.profiles.includes(pid)))) {
            validArray.push('collections')
        }
        console.log('TRIP VALIDATION:', validArray.join(' ,'))
        return validArray
    }
    public validateTripProperties = (trip: Trip, required: tripProperties[]): boolean => {
        const tripValidArray = this.validateTrip(trip)
        return required.every(v => tripValidArray.includes(v))
    }

    public createDisplayPackingList = (
        packingListPackables: PackingListPackable[],
        displayList: DisplayPackingList[] = []
    ): DisplayPackingList[] => {
        const firstTime = displayList.length === 0
        packingListPackables.forEach(item => {
            let profileIndex = displayList.findIndex(p => p.id == item.profileID)
            if (profileIndex == -1) {
                const profile = this.storeSelector.getProfileById(item.profileID)
                if(profile){
                    displayList.push(
                        new DisplayPackingList({
                            header:profile.name,
                            id: SHARED,
                            avatar: profile.avatar,
                            collections: []
                        })
                    )
                }else{
                    displayList.push(
                        new DisplayPackingList({
                            header: 'Shared',
                            id: SHARED,
                            avatar: new Avatar('together', this.colorGen.getUnused()),
                            collections: []
                        })
                    )
                }
                profileIndex = displayList.findIndex(p => p.id == item.profileID)
            }
            let collectionIndex = displayList[profileIndex].collections.findIndex(c => c.id == item.collectionID)
            if (collectionIndex == -1) {
                const collection = this.storeSelector.getCollectionById(item.collectionID)
                displayList[profileIndex].collections.push(
                    new listCollection({
                        header: collection.name,
                        id: item.collectionID,
                        packables: []
                    })
                )
                collectionIndex = displayList[profileIndex].collections.findIndex(p => p.id == item.collectionID)
            }
            let packableIndex = displayList[profileIndex].collections[collectionIndex].packables.findIndex(p => p.id == item.id)
            if (packableIndex === -1) {
                console.log(`👕 Added ${item.name} to ${displayList[profileIndex].header}/${displayList[profileIndex].collections[collectionIndex].header}`)
                item.recentlyAdded = firstTime ? item.recentlyAdded : true;
                displayList[profileIndex].collections[collectionIndex].packables.push(item)
            } else {
                let p = displayList[profileIndex].collections[collectionIndex].packables[packableIndex]
                if(p.dateModified < item.dateModified){
                    console.log(`👕 Updated ${displayList[profileIndex].header}/${displayList[profileIndex].collections[collectionIndex].header}/${item.name} new:`,item,'old:',p);
                    if ((!pass(p) && pass(item))) {
                        item.recentlyAdded = true;
                    }
                    Object.assign(p, item)
                }
            }
        })
        let SharedListIndex = displayList.findIndex(p => p.id === null);
        // push Shared list to the end
        if (SharedListIndex != -1) {
            displayList.push(...displayList.splice(SharedListIndex, 1))
        }
        const removeList: PackingListPackable[] = []
        displayList.forEach(profileList => {
            profileList.collections.forEach(colList => {
                colList.packables.forEach(p => {
                    // FIND MISSING PACKABLES
                    const i = packingListPackables.findIndexBy(p,['id','profileID','collectionID'])
                    if (i === -1) {
                        console.log(`👕 Couldnt find ${p.name}`,p)
                        removeList.push(p)
                    }
                })
                firstTime && colList.packables.sort((a, b) => {
                    const nameA = a.name.toUpperCase();
                    const nameB = b.name.toUpperCase();
                    return nameA > nameB ? 1 : -1;
                })
                    .sort((a, b) => {
                        return pass(a) ? (pass(b) ? 0 : -1) : (pass(b) ? 1 : 0)
                    })
            })
        })
        removeList.forEach(p => this.removePackableFromSortedList(p, displayList))
        return displayList;
    }
    removePackableFromSortedList(_p: PackingListPackable, list: DisplayPackingList[]) {
        let packables = list
            .findId(_p.profileID).collections
            .findId(_p.collectionID).packables
        const sortedListIndex = packables.findIndex(p => p.id === _p.id)
        console.log(`👕 removing ${_p.name} -  found at ${sortedListIndex}`, packables.slice())
        packables.splice(sortedListIndex, 1)
    }
}
