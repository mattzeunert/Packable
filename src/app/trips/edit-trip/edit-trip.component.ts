import { Component, OnInit, ViewChild, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { navParams } from '../../mobile-nav/mobile-nav.component';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { Trip } from '../../shared/models/trip.model';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { FormGroup, FormBuilder, Validators, FormArray, FormControl } from '@angular/forms';
import { DestinationDataService, Destination } from '../../shared/location-data.service';
import { Observable, Subscription } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { tap } from "rxjs/operators";
import * as FromApp from '../../shared/app.reducers'
import { Store } from '@ngrx/store';
import { Profile } from '../../shared/models/profile.model';
import { CollectionOriginal } from '../../shared/models/collection.model';
import { combineLatest } from 'rxjs/observable/combineLatest';
import * as moment from 'moment';
import { MatAutocomplete, MatAutocompleteTrigger } from '@angular/material';
import { listEditorParams, ListEditorService } from '../../shared/list-editor/list-editor.service';
import { StoreSelectorService } from '../../shared/store-selector.service';
import { MemoryService } from '../../shared/memory.service';



@Component({
  selector: 'app-edit-trip',
  templateUrl: './edit-trip.component.html',
  styleUrls: ['../../shared/css/full-flex.css', './edit-trip.component.css']
})
export class EditTripComponent implements OnInit {
  navParams: navParams;
  editMode = false;

  destinationName: string;
  destArray: Destination[];
  filteredDestOptions: Observable<Destination[]>;
  topDestOption: Destination;
  @ViewChild(MatAutocompleteTrigger) trigger: MatAutocompleteTrigger;
  fromDate: moment.Moment;
  toDate: moment.Moment;

  tripForm: FormGroup;
  editingTrip: Trip = {
    id: '',
    startDate: '',
    endDate: '',
    destinationId: '',
    profiles: [],
    activities: [],
    updated: ''
  }
  routeParams: Params;

  profiles_obs: Observable<{ profiles: Profile[] }>;
  sortedProfiles: Profile[];
  allProfiles: Profile[];

  collections_obs: Observable<{ collections: CollectionOriginal[] }>;
  allActivities: { name: string, collectionId: string }[];
  sortedActivities: { name: string, collectionId: string }[];

  item_limit = 9;
  state_subscription: Subscription;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private fb: FormBuilder,
    private destService: DestinationDataService,
    private store: Store<FromApp.appState>,
    private storeSelector: StoreSelectorService,
    private memoryService: MemoryService,
    private listEditorService: ListEditorService,
    private ref: ChangeDetectorRef
  ) {
    this.tripForm = fb.group({
      destinationId: [''],
      startDate: [''],
      endDate: [''],
      profiles: this.fb.array([]),
      activities: this.fb.array([])
    })
  }

  ngOnInit() {
    this.profiles_obs = this.store.select('profiles');
    this.collections_obs = this.store.select('collections');
    let routeParams = this.activatedRoute.params;

    this.state_subscription = combineLatest(
      routeParams,
      this.collections_obs,
      this.profiles_obs)
      .subscribe(([params, collectionsState, profilesState]) => {
        this.routeParams = params;
        this.allProfiles = profilesState.profiles;
        this.allActivities = collectionsState.collections.filter(x => x.activity == true).map(col => {
          return {
            name: col.name,
            collectionId: col.id
          }
        })
      })
    this.destArray = this.destService.destinations;
    this.editingTrip = this.memoryService.getTrip() || null;
    this.navSetup();
    this.formInit();
  }

  navSetup() {
    this.navParams = {
      header: this.destinationName ? 'Trip to ' + this.destinationName : 'New Trip',
      left: {
        enabled: true,
        text: 'Cancel',
        iconClass: 'fas fa-times'
      },
      right: {
        enabled: false,
        text: this.editMode ? 'Save' : 'Create',
        iconClass: 'fas fa-check'
      },
      options: []
    }
    // this.editMode
    //   && this.navParams.options.push({ 
    //     name: (this.advancedForm ? 'Remove' : 'Delete') +' Packable', 
    //     actionName: 'delete' 
    //   })
    //   && this.advancedForm
    //   && this.navParams.options.push({ name: 'Restore Default Settings', actionName: 'restore' });
    // this.packableForm.statusChanges.subscribe(status => {
    //   this.navParams.right.enabled = status == 'VALID' ? true : false;
    // })
  }

  formInit() {
    this.destinationAutoComplete();
    if (this.editingTrip) {
      this.tripForm.patchValue({
        destinationId: this.editingTrip.destinationId,
        startDate: this.editingTrip.startDate,
        endDate: this.editingTrip.endDate,
      })
      this.editingTrip.profiles.forEach(profileId => {
        this.onToggleProfile(profileId)
      })
      this.editingTrip.activities.forEach(activityId => {
        this.onToggleActivity(activityId)
      })
      this.destinationName = this.destService.cityById(this.editingTrip.id);
      this.fromDate = this.editingTrip.startDate ? moment(this.editingTrip.startDate, 'YYYY-MM-DD') : null;
      this.toDate = this.editingTrip.endDate ? moment(this.editingTrip.endDate, 'YYYY-MM-DD') : null;
      console.log(this.tripForm.value)
    }
    this.sortProfiles()
    this.sortActivities();
  }

  // PROFILE SELECTOR
  sortProfiles() {
    this.sortedProfiles = this.allProfiles;
    let selectedProfiles = this.sortedProfiles.filter(p => this.isProfileSelected(p.id))
    if (selectedProfiles.length >= this.item_limit) {
      this.sortedProfiles = selectedProfiles;
    } else {
      this.sortedProfiles = this.sortedProfiles
        .sort((a, b) => {
          let aSelected = this.isProfileSelected(a.id) ? 0 : 1;
          let bSelected = this.isProfileSelected(b.id) ? 0 : 1;
          return aSelected - bSelected;
        })
        .slice(0, this.item_limit)
    }
  }

  isProfileSelected(id: string): boolean {
    return !!this.tripForm.get('profiles').value.find(x => x == id)
  }
  onToggleProfile(id: string) {
    let selectedProfiles = (<FormArray>this.tripForm.get('profiles'))
    if (!this.isProfileSelected(id)) {
      selectedProfiles.push(this.fb.control(id))
    } else {
      let index = selectedProfiles.value.findIndex(x => x == id);
      selectedProfiles.removeAt(index);
    }
  }
  onMoreProfiles() {
    let usedList = this.allProfiles.filter(p => this.isProfileSelected(p.id))
    let listEditorParams: listEditorParams = {
      itemName: "Profiles",
      listType: "profiles",
      usedList: usedList,
      originalList: this.allProfiles
    }
    this.saveFormStateToMemory();
    this.listEditorService.setParams(listEditorParams);
    this.router.navigate(['profiles'], { relativeTo: this.activatedRoute });

  }

  // ACTIVITY SELECTOR
  sortActivities() {
    this.sortedActivities = this.allActivities;
    let selectedActivities = this.sortedActivities.filter(a => this.isActivitySelected(a.collectionId))
    if (selectedActivities.length >= this.item_limit) {
      this.sortedActivities = selectedActivities;
    } else {
      this.sortedActivities = this.sortedActivities
        .sort((a, b) => {
          let aSelected = this.isActivitySelected(a.collectionId) ? 0 : 1;
          let bSelected = this.isActivitySelected(b.collectionId) ? 0 : 1;
          return aSelected - bSelected;
        })
        .slice(0, this.item_limit)
    }

  }

  isActivitySelected(id: string): boolean {
    return !!this.tripForm.get('activities').value.find(x => x == id)
  }
  onToggleActivity(id: string) {
    let selectedActivities = (<FormArray>this.tripForm.get('activities'))
    if (!this.isActivitySelected(id)) {
      selectedActivities.push(this.fb.control(id))
    } else {
      let index = selectedActivities.value.findIndex(x => x == id);
      selectedActivities.removeAt(index);
    }
  }

  // DATE INPUT
  onDatesSelected(newDates: { from: moment.Moment, to: moment.Moment }) {
    this.tripForm.patchValue({
      startDate: moment(newDates.from).format('YYYY-MM-DD'),
      endDate: moment(newDates.to).format('YYYY-MM-DD')
    })
  }

  alert(str) {
    alert(str)
  }

  // DESTINATION INPUT
  displayDestination(dest?: Destination): string | undefined {
    return dest ? dest.fullName : undefined;
  }
  confirmDestination() {
    let value = this.tripForm.get('destinationId').value;
    let dest = this.destService.DestinationById(value)
    if (!dest && this.topDestOption) {
      let destId = this.topDestOption.id;
      this.tripForm.get('destinationId').patchValue(destId);
      value = this.tripForm.get('destinationId').value;
    }
  }
  destinationAutoComplete() {
    this.filteredDestOptions = this.tripForm.get('destinationId').valueChanges
      .pipe(
        //tap(search=>console.warn(`Searching "${search}"`)),
        startWith<string | Destination>(''),
        map(value => typeof value === 'string' ? value : value.city),
        map(val => {
          val = val.toLowerCase().trim();
          if (val.length > 2) {
            return this.destArray.filter(dest => {
              return this.destService.getScoreOfSearch(val, dest) > 0;
            }).sort((a, b) => {
              let aRank = (a.cityRank && a.cityRank != b.cityRank) ? a.cityRank / 2 : (a.countryRank ? a.countryRank * 3 : 1000);
              let bRank = (b.cityRank && a.cityRank != b.cityRank) ? b.cityRank / 2 : (b.countryRank ? b.countryRank * 3 : 1000);
              let aScore = this.destService.getScoreOfSearch(val, a) + (1000 / aRank)
              let bScore = this.destService.getScoreOfSearch(val, b) + (1000 / bRank)
              return bScore != aScore ? bScore - aScore : aRank - bRank;
            }).slice(0, 10)
            // .map(dest => {
            //   return { ...dest, fullName: `${dest.fullName.substring(0,15)} (${this.destService.getScoreOfSearch(val, dest,true)}) (${dest.cityRank} | ${dest.countryRank})` }
            // })
          } else {
            return []
          }
        })
      )
    this.filteredDestOptions.subscribe(list => {
      this.topDestOption = list[0];
    })

  }

  saveFormStateToMemory() {
    this.editingTrip = this.tripForm.value;
    this.memoryService.setTrip(this.editingTrip);
  }

  return() {
    this.router.navigate(['../'], { relativeTo: this.activatedRoute });
  }
}
