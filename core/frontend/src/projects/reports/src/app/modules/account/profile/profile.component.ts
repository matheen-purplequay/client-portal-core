import { Component, OnInit } from '@angular/core';
import { LocalStorageService } from '../../../services/app/storage/local-storage.service';
import { LoginService } from '../../../services/authentication/login.service';
import { ToastService } from 'pq-ui';
import { AccountService } from '../../../services/account/account.service';
import { ImageCropperComponent, ImageCroppedEvent, LoadedImage } from 'ngx-image-cropper';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { NgxImageCompressService } from 'ngx-image-compress';
import { DataService } from '../../../services/app/data.service';
import { CloudMessagingService } from '../../../services/app/notifications/cloud-messaging.service';

interface ProfileData {
  vertical: string[];
  team: string[];
  clientDirector: string;
  teamLead: string;
  teamMembersCount: number;
  teamLeadEmail: string;
}

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {

  organizationDetails: ProfileData = {
    vertical: ['SMSF'],
    team: ['SMSF Team'],
    clientDirector: "Roshan",
    teamLead: "Harish Kumar",
    teamMembersCount: 4,
    teamLeadEmail: "harishkumar@gmail.com",
  };
  selectedVertical = this.organizationDetails.vertical[0];
  selectedTeam = this.organizationDetails.team[0];
  user: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    designation: string;
    company_name: string;
    location: string;
    is_tester: boolean;
    master_company_name: any
  } = {
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      designation: "",
      company_name: "",
      location: "",
      is_tester: false,
      master_company_name: ''
    };

  new_password = '';
  confirm_password = '';
  isPasswordValid: boolean = false;

  filterTabs: {
    tabs: { index: number, label: string }[],
    selectedTab: { index: number, label: string }
  } = {
      tabs: [
        { index: 0, label: 'Organization' },
        { index: 1, label: 'Profile Details' }
      ],
      selectedTab: { index: 1, label: 'Personal Information' }
    };

  profilePicture: string | SafeUrl = '';
  originalProfilePicture: string | SafeUrl = '';
  emptyProfilePicture: string = '/assets/images/profile_placeholder.png';

  isShowProfilePictureSelector: boolean = false;
  isProfilePicturesLoaded: boolean = false;
  profilePictures: any[] = [];
  isProfilePictureSaving: boolean = false;
  loginActivities: any[] = [];

  imageChangedEvent: Event | null = null;
  croppedImage: SafeUrl | undefined = '';
  compressedImage: string | undefined;
  showCropper: boolean = false;
  selectedPhoto: File | undefined;
  isCustomPhoto: boolean = false;

  isLoadingPhoto: boolean = false;
  isPhotoLoaded: boolean = false;

  isSendingTestNotification: boolean = false;

  constructor(
    private localStorageService: LocalStorageService,
    private loginService: LoginService,
    private toastService: ToastService,
    private accountService: AccountService,
    private sanitizer: DomSanitizer,
    private imageCompress: NgxImageCompressService,
    private dataService: DataService,
    private cloudMessagingService: CloudMessagingService
  ) { }

  ngOnInit(): void {
    this.setupAmbience();
  }

  setupAmbience() {
    this.user.first_name = this.localStorageService.getItem('userdata').first_name;
    this.user.last_name = this.localStorageService.getItem('userdata').last_name;
    this.user.email = this.localStorageService.getItem('userdata').email;
    this.user.company_name = this.localStorageService.getItem('userdata').company_name;
    this.user.is_tester = this.localStorageService.getItem('userdata').is_tester;
    this.user.master_company_name = this.localStorageService.getItem('userdata').master_company.name;
    this.profilePicture = this.localStorageService.getItem('userdata').profile_picture;
    this.originalProfilePicture = this.profilePicture;
    
    this.getProfilePicture();
    this.getProfilePictures();
    this.getLoginActivities();
  }

  getLoginActivities() {
    const body = {
      user_id: this.localStorageService.getItem('userdata').user_id
    };
    this.loginService.getLoginActivities(body).subscribe((res: any) => {
      this.loginActivities = res.data;
    });
  }

  getProfilePicture() {
    this.isLoadingPhoto = true;
    const body = {
      user_id: this.localStorageService.getItem('userdata').user_id
    };
    this.accountService.getProfilePictureByUserId(body).subscribe({
      next: (res: any) => {
        this.isLoadingPhoto = false;
        if(res.status) {
          let ls_user = this.localStorageService.getItem('userdata');
          ls_user.profile_picture = res.data;
          this.localStorageService.setItem('userdata', ls_user);
          this.profilePicture = res.data;
          this.originalProfilePicture = res.data;
          window.dispatchEvent(new Event('storage'));
        }
      },
      error: (err: any) => {
        this.isLoadingPhoto = false;
      }
    })
  }

  getProfilePictures() {
    // this.accountService.getProfilePicturesPreview().subscribe((res: any) => {
    //   this.isProfilePicturesLoaded = true;
    //   if(res.status) this.profilePictures = res.data;
    //   console.log('profile pictures links ', res);
    // });
    this.profilePictures = [
      '/assets/images/client_user1.png',
      '/assets/images/client_user2.png',
      '/assets/images/client_user3.png',
      '/assets/images/client_user4.png',
      '/assets/images/client_user5.png',
      '/assets/images/client_user6.png'
    ];
    this.isProfilePicturesLoaded = true;
  }

  saveProfilePicture(path: string | SafeUrl) {
    this.isProfilePictureSaving = true;
    // Read the image as a Blob
    this.dataService.doGetAsBlob(path.toString()).subscribe((blob: any) => {
      const file = new File([blob], 'profile_photo.jpg', { type: blob.type });
      const body = {
        client_id: this.localStorageService.getItem('userdata').user_id
      };
      this.accountService.saveProfilePhoto(body, file).subscribe((res: any) => {
        this.isProfilePictureSaving = false;
        if (res.status) {
          this.toastService.show('Profile picture saved', 'Saved', 'success', true);
          let ls_user = this.localStorageService.getItem('userdata');
          ls_user.profile_picture = res.path;
          this.localStorageService.setItem('userdata', ls_user);
          this.isShowProfilePictureSelector = false;
          window.dispatchEvent(new Event('storage'));
          this.originalProfilePicture = res.path;
          this.profilePicture = this.originalProfilePicture;
        }
        else this.toastService.show('Something went wrong. Please try again.', 'Problem', 'warning', true);
      });
    });
  }

  saveProfilePhoto() {
    this.isProfilePictureSaving = true;
    const body = {
      client_id: this.localStorageService.getItem('userdata').user_id
    };
    this.accountService.saveProfilePhoto(body, this.selectedPhoto!).subscribe((res: any) => {
      this.isProfilePictureSaving = false;
      if (res.status) {
        this.toastService.show('Profile picture saved', 'Saved', 'success', true);
        let ls_user = this.localStorageService.getItem('userdata');
        ls_user.profile_picture = res.path;
        this.localStorageService.setItem('userdata', ls_user);
        this.isShowProfilePictureSelector = false;
        window.dispatchEvent(new Event('storage'));
        this.originalProfilePicture = res.path;
        this.profilePicture = this.originalProfilePicture;
      }
      else this.toastService.show('Something went wrong. Please try again.', 'Problem', 'warning', true);
    });
  }

  resetProfilePicture() {
    this.profilePicture = this.originalProfilePicture;
    this.isShowProfilePictureSelector = false;
    this.isCustomPhoto = false;
  }

  checkIsPasswordValid() {
    const upperCaseRegex = /[A-Z]/;
    const lowerCaseRegex = /[a-z]/;
    const specialCharRegex = /[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]/;

    this.isPasswordValid = (
      (upperCaseRegex.test(this.new_password) && lowerCaseRegex.test(this.new_password) && specialCharRegex.test(this.new_password)) &&
      (upperCaseRegex.test(this.confirm_password) && lowerCaseRegex.test(this.confirm_password) && specialCharRegex.test(this.confirm_password)) &&
      (this.new_password == this.confirm_password && this.new_password != '' && this.confirm_password != '')
    );
  }

  changePassword() {
    if (this.new_password == this.confirm_password) {
      const body = {
        email: this.localStorageService.getItem('userdata').email,
        password: this.new_password
      };
      this.loginService.changePassword(body).subscribe((data: any) => {
        this.toastService.show('Password has been changed.', 'Password updated', 'success', true);
      });
    }
  }

  getJSONValue(value: string) {
    return JSON.parse(value);
  }

  getBrowserLogo(browser: string) {
    const path = '/assets/icons';
    let logo = 'browser'

    if (browser.toLowerCase().includes('chrome') || browser.toLowerCase().includes('microsoft') || browser.toLowerCase().includes('safari')) {
      logo = browser.split(' ').join('_').toLowerCase();
    }
    return `${path}/${logo}.png`;
  }


  fileChangeEvent(event: Event): void {
    this.imageChangedEvent = event;
    this.isLoadingPhoto = true;
    if ((event.target as any).files.length > 0) this.showCropper = true;
    else {
      this.showCropper = false;
    }
  }

  imageCropped(event: ImageCroppedEvent) {
    this.croppedImage = this.sanitizer.bypassSecurityTrustUrl(event.objectUrl!);
    this.profilePicture = this.croppedImage.toString();
    // if(event.blob) this.selectedPhoto = this.blobToFile(event.blob, 'profile_photo');
    this.imageCompress.compressFile(URL.createObjectURL(event.blob!), -1, 50, 50).then(
      result => {
        this.compressedImage = result;
        // Convert base64 to blob
        const byteString = atob(result.split(',')[1]);
        const mimeString = result.split(',')[0].split(':')[1].split(';')[0];
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
          ia[i] = byteString.charCodeAt(i);
        }
        const blob = new Blob([ab], { type: mimeString });
        this.selectedPhoto = new File([blob], 'profile_photo.jpg', { type: mimeString });
      }
    );
  }

  blobToFile(blob: Blob, fileName: string): File {
    return new File([blob], fileName, { type: blob.type });
  }

  imageLoaded(image: LoadedImage) {
    this.isLoadingPhoto = false;
  }

  cropperReady() {
    this.showCropper = true;
    this.isLoadingPhoto = false;
  }

  loadImageFailed() {
    this.showCropper = false;
    this.isLoadingPhoto = false;
  }

  resetCropper() {
    this.imageChangedEvent = null;
    this.croppedImage = undefined;
    this.showCropper = false;
  }

  sendTestNotification() {
    this.isSendingTestNotification = true;
    this.cloudMessagingService.sendTestNotification()!.subscribe(res => {
      this.isSendingTestNotification = false;
    });
  }
}
