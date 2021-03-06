import { absoluteMin, absoluteMax, weatherData } from '../services/weather.service';
import { WeatherRule, hotWeather, warmWeather, coolWeather, coldWeather, weatherType } from '../models/weather.model';
import { isDefined, titleCase, decodeHtml } from '../global-functions';

export const degC = `&#176;C`

export interface weatherIconData {
    icon: string,
    description: string
}

export class weatherFactory{
    isSet(wr:WeatherRule):boolean{
        return wr.minTemp>absoluteMin || wr.maxTemp<absoluteMax || wr.weatherTypes.length>0
    }
    deepCopy(wr:WeatherRule = new WeatherRule()):WeatherRule{
        return new WeatherRule(
            wr.minTemp || absoluteMin, 
            wr.maxTemp || absoluteMax, 
            isDefined(wr.weatherTypes) ? wr.weatherTypes.slice(): []
            )
    }
    weatherDataIsValid(wd:weatherData):boolean{
        return isDefined(wd.minTemp) && isDefined(wd.maxTemp) && isDefined(wd.weatherTypes);
    }
    getTempString({minTemp,maxTemp,weatherTypes}:WeatherRule):string{
        if(minTemp==absoluteMin && maxTemp == absoluteMax){
            return `Any Temperature`
        } else if (minTemp > absoluteMin && maxTemp == absoluteMax) {
            return `Above ${minTemp + degC}`
        } else if (minTemp == absoluteMin && maxTemp < absoluteMax) {
            return `Below ${maxTemp + degC}`
        } else if (minTemp > absoluteMin && maxTemp < absoluteMax) {
            return `${minTemp} &minus; ${maxTemp + degC}`
        } else {
            'Temperature invalid'
        }
    }
    getWeatherIcons(wr:WeatherRule): weatherIconData[]{
        let returnArray:weatherIconData[] = []
        if(this.isSet(wr)){
            if(wr.minTemp!=absoluteMin || wr.maxTemp !=absoluteMax){
                let iconName = 'temp';
                if(wr.minTemp >= warmWeather&&  wr.maxTemp>=hotWeather){
                    iconName = 'temp-high'
                } else if (wr.maxTemp <= coolWeather && wr.maxTemp<warmWeather) {
                    iconName = 'temp-low'
                } else if (wr.minTemp>absoluteMin && wr.maxTemp<absoluteMax) {
                    iconName = 'temp-mid'
                }
                returnArray.push({icon: iconName,description: decodeHtml(this.getTempString(wr))})
            }
            if (wr.weatherTypes.length>0){
                wr.weatherTypes.forEach(type => returnArray.push({icon: type, description: titleCase(type)}))
            }
        } 
        return returnArray;
    }
}