import {Effect, Actions, ofType} from '@ngrx/effects'
import { Injectable } from '@angular/core';
import { switchMap, mergeMap, catchError, tap } from 'rxjs/operators';
import { from, of } from 'rxjs';
import * as firebase from 'firebase';
import * as AuthActions from './auth.actions'
import { TryLogin } from './auth.actions';
import { StorageService } from '../../shared/storage/storage.service';
import * as tripActions  from '../../trips/store/trip.actions';
import * as profileActions from '../../profiles/store/profile.actions';
import * as collectionActions from '../../collections/store/collections.actions'
import * as packableActions from '../../packables/store/packables.actions'
import * as uesrActions from '../../user/store/user.actions'
import { defaultUserSettings } from './userState.model';

@Injectable()
export class AuthEffects {
    constructor(
        private actions$: Actions,
        private storageService: StorageService

    ){}

    @Effect() authTryRegister = this.actions$.pipe(
        ofType<AuthActions.TryRegister>(AuthActions.TRY_REGISTER),
        switchMap((tryRegister:AuthActions.TryRegister) => {
             return from(firebase.auth().createUserWithEmailAndPassword(tryRegister.payload.email,tryRegister.payload.password)).pipe(
                 switchMap(() => {
                     return from(firebase.auth().currentUser.getIdToken()).pipe(
                        mergeMap((token:string)=>{
                            return [
                                {type: AuthActions.REGISTER},
                                {type: AuthActions.SET_TOKEN, payload:token}
                            ]
                        })
                     )
                 }),
                  catchError((error)=> of(new AuthActions.AuthFail(error['message'])))
             )
        }),
    )
    @Effect() authTryLogin = this.actions$.pipe(
        ofType<AuthActions.TryLogin>(AuthActions.TRY_LOGIN),
        switchMap((tryLogin:AuthActions.TryLogin) => {
             return from(firebase.auth().signInWithEmailAndPassword(tryLogin.payload.email,tryLogin.payload.password)).pipe(
                 switchMap(() => {
                     return from(firebase.auth().currentUser.getIdToken()).pipe(
                        mergeMap((token:string)=>{
                            return [
                                {type: AuthActions.LOGIN},
                                {type: AuthActions.SET_TOKEN, payload:token}
                            ]
                        })
                     )
                 }),
                  catchError((error)=> of(new AuthActions.AuthFail(error['message'])))
             )
        }),
    )
    @Effect({dispatch:false}) authRegister = this.actions$.pipe(
        ofType(AuthActions.REGISTER),
        tap(()=>{
            this.storageService.setInitialUserConfig()
        })
    )
    @Effect({dispatch:false}) authGetUserData = this.actions$.pipe(
        ofType(AuthActions.LOGIN),
        tap(()=>{
            this.storageService.getAllUserItems()
            this.storageService.getUserConfig()
        })
    )
    @Effect() authLogOut = this.actions$.pipe(
        ofType<AuthActions.Logout>(AuthActions.LOGOUT),
        mergeMap(()=>{
            return [
                new packableActions.setPackableState([]),
                new collectionActions.setCollectionState([]),
                new profileActions.setProfileState([]),
                new uesrActions.setUserSettings(null),
                new uesrActions.setUserPermissions(null),
                new tripActions.setTripState({trips:[],packingLists:[]})
            ]
        })
    )
}