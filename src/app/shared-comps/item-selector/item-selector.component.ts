import { Component, OnInit, Input, Output, EventEmitter, Type, TemplateRef, Renderer2, ElementRef, ViewChild } from '@angular/core';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import * as fromApp from '../../shared/app.reducers';
import { FilteredArray, objectInArray } from '../../shared/global-functions';
import { ListEditorService, listEditorParams, item } from '../../shared/services/list-editor.service';
import { ActivatedRoute, Router, Params } from '@angular/router';
import { Location } from '@angular/common';
import { MemoryService } from '../../shared/services/memory.service';
import { navParams } from '../mobile-nav/mobile-nav.component';
import { modalConfig, ModalComponent } from '../modal/modal.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Profile } from '../../shared/models/profile.model';
import { listItemTrigger, quickTransitionTrigger, animateSize } from '../../shared/animations';
import { AnimationEvent } from '@angular/animations';

export type filterItemLocality = 'user'|'local'|'remote';

export interface filterItem{
  id: string,
  name: string,
  type: filterItemLocality,
}


@Component({
  selector: 'app-item-selector',
  templateUrl: './item-selector.component.html',
  styleUrls: ['../../shared/css/full-flex.css', './item-selector.component.css'],
  animations: [quickTransitionTrigger, listItemTrigger, animateSize]
})
export class ItemSelectorComponent implements OnInit {

  @Input('completeList') listOriginal: filterItem[];
  @Input('usedList') listUsed: filterItem[] = [];
  @Output('onSelect') selectedEvent = new EventEmitter<filterItem[]>();
  @Output() confirm = new EventEmitter<void>()
  @ViewChild('basket') basket: ElementRef;

  selected: filterItem[] = []
  selectedWas: number;
  listFiltered: FilteredArray;
  searchFilterInput: string = '';
  animateItemsState: number;

  constructor(
    private renderer:Renderer2,
    private element: ElementRef

  ) { }

  ngOnInit() {
    this.listFiltered = new FilteredArray()
    this.listFiltered.original = this.listOriginal
    this.resetFilters()
  }
  
  resetSearch(){
    this.searchFilterInput ='';
    this.resetFilters();
  }

  resetFilters(){
    this.listFiltered.reset()
    this.listFiltered.filterUsed('id',this.listUsed);
  }

  filterTimeout = setTimeout(()=>{},0)

  typeSearch(){
    if(this.searchFilterInput ==''){
      this.resetFilters();
    } else {
      clearTimeout(this.filterTimeout)
      this.filterTimeout = setTimeout(()=>{
        this.applySearchFilter()
      }, 800)
    }
  }

  applySearchFilter() {
    this.listFiltered.reset();
    this.listFiltered.filterFromSearch('name', this.searchFilterInput)
  }

  objectSelected(item: filterItem):boolean{
    return this.selected.idIndex(item.id) > -1
  }

  objectUsed(item: filterItem):boolean {
    return this.listUsed.idIndex(item.id) > -1
  }

  availableItems():number{
    return this.listFiltered.filtered.filter(item=>!this.objectSelected(item)).length
  }

  toggleItemInSelection(item:filterItem, id:number){
    if(!this.objectUsed(item)){
      if(!this.objectSelected(item)){
        this.addItemToSelection(item);
      } else {
        this.removeItemFromSelection(item.id);
      }
    }
  }
  addItemToSelection(item: filterItem) {
      this.selectedWas = this.selected.length;
      this.selected.unshift(item)
      this.emitSelected();
  }
  addItemFromSearch(item:filterItem){
    if(this.searchFilterInput !='' && !this.objectSelected(item)){
      this.addItemToSelection(item);
    }
  }
  removeItemFromSelection(id: string) {
    this.selectedWas = this.selected.length;
    let index = this.selected.idIndex(id);
    this.selected.splice(index, 1);
    this.emitSelected();
  }

  emitSelected() {
    this.selectedEvent.emit(this.selected)
  }
  startHeight: number;
  setStartHeight(){
    this.startHeight = this.basket.nativeElement.clientHeight
  }
  getEndHeight(){
    let selectedRef = this.basket.nativeElement.querySelector('.ps-selected-container')
    return  selectedRef.clientHeight + 10
  }
  animateItemStart(e:AnimationEvent){
    this.setStartHeight();
  }
  animateItemEnd(e:AnimationEvent){
    this.animateItemsState = this.getEndHeight()
    //his.setStartHight();
  }
  onConfirm(){
    if(this.valid()){
      this.confirm.emit()
    }
  }
  valid():boolean{
    return this.selected.length>0
  }
}
