import { DataSource } from '@angular/cdk/collections';
import { MatPaginator, MatSort } from '@angular/material';
import { map, delay } from 'rxjs/operators';
import { Observable, of as observableOf, merge, Subscription } from 'rxjs';
import { userPermissions } from '../../user/store/userState.model';
import { StoreSelectorService } from '@app/core';
import { StorageService } from '../../shared/storage/storage.service';
import { Pipe } from '@angular/core';
import { Store } from '@ngrx/store';
import * as fromApp from '@shared/app.reducers';
import { User } from '../store/adminState.model';

// TODO: Replace this with your own data model type

// TODO: replace this with real data from your application

/**
 * Data source for the AdminUserTable view. This class should
 * encapsulate all logic for fetching and manipulating the displayed data
 * (including sorting, pagination, and filtering).
 */
export class AdminUserTableDataSource extends DataSource<User> {
  dataObservable: Observable<User[]>;
  // data: User[] = [];
  subs: Subscription;
  constructor(
    private paginator: MatPaginator, 
    private sort: MatSort, 
    private store: Store<fromApp.appState>,
    public data
    ) {
    super();
  }

  /**
   * Connect this data source to the table. The table will only update when
   * the returned stream emits new items.
   * @returns A stream of the items to be rendered.
   */
  loadData(){
    
  }
  connect(): Observable<User[]> {
    this.dataObservable = this.store.select('admin').pipe(map(state=>state.users))
    this.subs = this.dataObservable.subscribe(data=>{
        
          this.data = data
          console.log('received data:',data);  
          
    })
      
    // Combine everything that affects the rendered data into one update
    // stream for the data-table to consume.

    const dataMutations = [
      this.dataObservable,
      this.paginator.page,
      this.sort.sortChange
    ];

    // Set the paginator's length
    this.paginator.length = this.data.length

    return merge(...dataMutations).pipe(
    map(() => {
      console.log('emitted', this.data);
      return this.getPagedData(this.getSortedData([...this.data]));
    }))
  }

  /**
   *  Called when the table is being destroyed. Use this function, to clean up
   * any open connections or free any held resources that were set up during connect.
   */
  disconnect() {
    this.subs.unsubscribe();
  }

  /**
   * Paginate the data (client-side). If you're using server-side pagination,
   * this would be replaced by requesting the appropriate data from the server.
   */
  private getPagedData(data: User[]) {
    const startIndex = this.paginator.pageIndex * this.paginator.pageSize;
    return data.splice(startIndex, this.paginator.pageSize);
  }

  /**
   * Sort the data (client-side). If you're using server-side sorting,
   * this would be replaced by requesting the appropriate data from the server.
   */
  private getSortedData(data: User[]) {
    if (!this.sort.active || this.sort.direction === '') {
      return data;
    }

    return data.sort((a, b) => {
      const isAsc = this.sort.direction === 'asc';
      switch (this.sort.active) {
        case 'alias': return compare(a.alias, b.alias, isAsc);
        case 'id': return compare(+a.id, +b.id, isAsc);
        case 'permissions': return compare(countPermissions(a.permissions), countPermissions(b.permissions), isAsc);
        default: return 0;
      }
    });
  }
}

/** Simple sort comparator for example ID/Name columns (for client-side sorting). */
function compare(a, b, isAsc) {
  return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}
function countPermissions(permissions:userPermissions):number{
  let i = 0;
  for(let p in permissions){
    if(!!permissions[p]){
      i++
    }
  }
  return i
}