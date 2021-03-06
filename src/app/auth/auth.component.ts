import { DataStorageService } from './../shared/data-storage.service';
import { PlaceHolderDirective } from './../shared/placeholder/placeholder.directive';
import { AlertComponent } from './../shared/alert/alert.component';
import { Component, ComponentFactoryResolver, ViewChild, OnDestroy } from '@angular/core';
import {NgForm} from '@angular/forms';
import {AuthResponseData, AuthService} from './auth.service';
import { Observable, Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { logging } from 'protractor';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html'
})
export class AuthComponent implements OnDestroy {
  isLoginMode = true;
  isLoading = false;
  loginSignup = 'Switch to Signup';
  error: string = null;
  private closeSub: Subscription;

  @ViewChild(PlaceHolderDirective, {static: false}) alertHost: PlaceHolderDirective;

  constructor(private authService: AuthService,
              private router: Router,
              private componentFactoryResolver: ComponentFactoryResolver,
              private dataStorageService: DataStorageService) {  }

  onSwitchMode() {
    this.isLoginMode = !this.isLoginMode;
    
    if (this.isLoginMode) {
      this.loginSignup = 'Switch to Signup';
    } else {
      this.loginSignup = 'Switch to Login';
    }
  }

  onSubmit(authForm: NgForm) {

    if (!authForm.valid) {
      return;
    }
    const email = authForm.value.email;
    const password = authForm.value.password;
    let authObs: Observable<AuthResponseData>;

    this.isLoading = true;
    if (this.isLoginMode) {
      authObs = this.authService.login(email, password);
    } else {
      authObs = this.authService.singup(email, password);
    }

    authObs.subscribe(resData => {
      console.log(resData);
      this.dataStorageService.fetchRecipes().subscribe();
      this.isLoading = false;
      this.router.navigate(['/recipes']);
    }, errorMessage => {
      console.log(errorMessage);
      this.error = errorMessage;
      this.showErrorAlert(errorMessage);
      this.isLoading = false;
    });
    authForm.resetForm();
  }

  onHandleError() {
    this.error = null;
  }

  private showErrorAlert(message: string) {
    const alertComponentFactory = this.componentFactoryResolver.resolveComponentFactory(AlertComponent);
    const hostViewContainerRef = this.alertHost.viewContainerRef;
    hostViewContainerRef.clear();

    const componentRef = hostViewContainerRef.createComponent(alertComponentFactory);
    componentRef.instance.message = message;
    this.closeSub = componentRef.instance.close.subscribe(() => {
      this.closeSub.unsubscribe();
      hostViewContainerRef.clear();
    });
  }

  ngOnDestroy() {
    if (this.closeSub) {
      this.closeSub.unsubscribe();
    }
  }
}
