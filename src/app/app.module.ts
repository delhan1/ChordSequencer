import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppComponent} from './app.component';
import {FontAwesomeModule} from '@fortawesome/angular-fontawesome';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {ChordRepository} from './chord.repository';
import {DragDropModule} from '@angular/cdk/drag-drop';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {
  MatButtonModule,
  MatCardModule,
  MatCheckboxModule,
  MatFormFieldModule,
  MatGridListModule,
  MatIconModule,
  MatRippleModule,
  MatSelectModule,
  MatSliderModule
} from '@angular/material';
import {FlexLayoutModule} from '@angular/flex-layout';
import {DrumsequencerComponent} from './drumsequencer/drumsequencer.component';
import {DrumRepository} from './drumsequencer/repository/drum.repository';

@NgModule({
  declarations: [
    AppComponent,
    DrumsequencerComponent
  ],
  imports: [
    BrowserModule,
    FontAwesomeModule,
    ReactiveFormsModule,
    DragDropModule,
    BrowserAnimationsModule,
    FlexLayoutModule,
    MatSliderModule,
    MatGridListModule,
    MatCardModule,
    MatRippleModule,
    MatCheckboxModule,
    MatIconModule,
    MatButtonModule,
    FormsModule,
    MatFormFieldModule,
    MatSelectModule,
  ],
  providers: [ChordRepository, DrumRepository],
  bootstrap: [AppComponent]
})
export class AppModule {
}
