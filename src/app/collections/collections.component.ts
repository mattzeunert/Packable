import { Component, OnInit, OnDestroy, Output, TemplateRef } from '@angular/core';
import * as fromApp from '../shared/app.reducers';
import { Store } from '@ngrx/store';
import { Observable ,  Subscription } from 'rxjs';
import { CollectionPrivate, CollectionOriginal, CollectionComplete } from '../shared/models/collection.model';
import { Router, ActivatedRoute } from '@angular/router';
import { MemoryService } from '../shared/services/memory.service';
import { StoreSelectorService } from '../shared/services/store-selector.service';
import { ModalComponent } from '../shared-comps/modal/modal.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { slugName } from '../shared/global-functions';
import { CollectionFactory } from '../shared/factories/collection.factory';
import { take } from 'rxjs/operators';
import { ContextService } from '../shared/services/context.service';
import { blockInitialAnimations } from '../shared/animations';

@Component({
  selector: 'app-collections',
  templateUrl: './collections.component.html',
  styleUrls: ['../shared/css/mat-card-list.css',
  './collections.component.css'],
  animations: [blockInitialAnimations]
  
})
export class CollectionsComponent implements OnInit,OnDestroy {
  @Output('test') test:string = 'test worked';
  collectionState_obs: Observable<{collections: CollectionOriginal[]}>
  collectionState_sub: Subscription;
  collections: CollectionComplete[];
  constructor(
    private store:Store<fromApp.appState>,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private memoryService: MemoryService,
    private collectionFactory: CollectionFactory,
    private selectorService: StoreSelectorService,
    private modalService: NgbModal,
    private context: ContextService,

  ) { }

  ngOnInit() {
    this.context.reset();
    this.collectionState_obs = this.store.select('collections');
    this.collectionState_sub = this.collectionState_obs.subscribe(state =>{
      this.collections = this.collectionFactory.makeCompleteArray(state.collections)
    })
  }

  ngOnDestroy(){
    this.collectionState_sub.unsubscribe();
  }
  editCollection(id:string){
    // this.memoryService.resetAll();
    // let collection = this.selectorService.getCollectionById(id)
    // this.memoryService.set('ORIGINAL_COLLECTION',collection);
    // this.router.navigate([slugName(collection.name)], {relativeTo: this.activatedRoute})
  }
  newCollection(){
    // this.memoryService.resetAll();
    // this.router.navigate(["new"], {relativeTo: this.activatedRoute})
  }
  openModal(tempRef:TemplateRef<any>) {
    const modal = this.modalService.open(ModalComponent);
    modal.componentInstance.inputTemplate = tempRef;
  }
}
