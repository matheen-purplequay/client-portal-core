import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { StorageService } from '../../../services/app/storage/storage.service';
import { ToastService } from 'pq-ui';
import { AccountService } from '../../../services/account/account.service';
import { NgxImageCompressService } from 'ngx-image-compress';
import { DataService } from '../../../services/app/base/data.service';
import { ImageCroppedEvent, LoadedImage } from 'ngx-image-cropper';
import { CloudMessagingService } from '../../../services/app/network/cloud-messaging.service';

interface ProfileData {
  vertical: string[];
  team: string[];
  clientDirector: string;
  teamLead: string;
  teamMembersCount: number;
  teamLeadEmail: string;
}

@Component({
  selector: 'app-my-profile',
  templateUrl: './my-profile.component.html',
  styleUrls: ['./my-profile.component.scss']
})
export class MyProfileComponent implements OnInit {

  user: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    designation: string;
    company_name: string;
    location: string;
  } = {
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      designation: "",
      company_name: "",
      location: ""
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
  croppedImage: SafeUrl = '';
  compressedImage: string | undefined;
  showCropper: boolean = false;
  selectedPhoto: File | undefined;
  isCustomPhoto: boolean = false;

  isLoadingPhoto: boolean = false;
  isPhotoLoaded: boolean = false;

  isSendingTestNotification: boolean = false;


  constructor(
    private storageService: StorageService,
    private toastService: ToastService,
    private accountService: AccountService,
    private sanitizer: DomSanitizer,
    private imageCompress: NgxImageCompressService,
    private dataService: DataService,
    private cloudMessagingService: CloudMessagingService
  ) { }

  ngOnInit(): void {
    this.user.first_name = this.storageService.getItem('userdata').first_name;
    this.user.last_name = this.storageService.getItem('userdata').last_name;
    this.user.email = this.storageService.getItem('userdata').email;
    this.user.company_name = this.storageService.getItem('userdata').company_name;
    this.profilePicture = this.storageService.getItem('userdata').profile_picture;
    this.originalProfilePicture = this.profilePicture;
    this.getProfilePicture();
  }

  setupAmbiance() {
    this.getProfilePicture();
    this.getProfilePictures();
  }

  getProfilePictures() {
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


  getProfilePicture() {
    this.isLoadingPhoto = true;
    const body = {
      user_id: this.storageService.getItem('userdata').user_id
    };
    this.accountService.getProfilePictureByUserId(body).subscribe({
      next: (res: any) => {
        this.isLoadingPhoto = false;
        let ls_user = this.storageService.getItem('userdata');
        ls_user.profile_picture = res.data;
        this.storageService.setItem('userdata', ls_user);
        this.profilePicture = res.data;
      },
      error: (err: any) => {
        this.isLoadingPhoto = false;
      }
    })
  }

  saveProfilePicture(path: string | SafeUrl) {
    this.isProfilePictureSaving = true;
    // Read the image as a Blob
    this.dataService.doGetAsBlob(path.toString()).subscribe((blob: any) => {
      const file = new File([blob], 'profile_photo.jpg', { type: blob.type });
      const body = {
        client_id: this.storageService.getItem('userdata').user_id
      };
      this.accountService.saveProfilePhoto(body, file).subscribe((res: any) => {
        this.isProfilePictureSaving = false;
        if (res.status) {
          this.toastService.show('Profile picture saved', 'Saved', 'success', true);
          let ls_user = this.storageService.getItem('userdata');
          ls_user.profile_picture = res.path;
          this.storageService.setItem('userdata', ls_user);
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
      client_id: this.storageService.getItem('userdata').user_id
    };
    this.accountService.saveProfilePhoto(body, this.selectedPhoto!).subscribe((res: any) => {
      this.isProfilePictureSaving = false;
      if (res.status) {
        this.toastService.show('Profile picture saved', 'Saved', 'success', true);
        let ls_user = this.storageService.getItem('userdata');
        ls_user.profile_picture = res.path;
        this.storageService.setItem('userdata', ls_user);
        this.isShowProfilePictureSelector = false;
        this.originalProfilePicture = res.path;
        this.profilePicture = this.originalProfilePicture;
        window.dispatchEvent(new Event('storage'));
      }
      else this.toastService.show('Something went wrong. Please try again.', 'Problem', 'warning', true);
    });
  }

  resetProfilePicture() {
    this.profilePicture = this.originalProfilePicture;
    this.isShowProfilePictureSelector = false;
  }

  fileChangeEvent(event: Event): void {
    this.imageChangedEvent = event;
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

  }

  cropperReady() {
    // cropper ready
  }

  loadImageFailed() {
    // show message
  }

  sendTestNotification() {
    this.isSendingTestNotification = true;
    this.cloudMessagingService.sendTestNotification()!.subscribe({
      next: (res: any) => {
        this.isSendingTestNotification = false;
      },
      error: (err: any) => {
        this.isSendingTestNotification = false;
      }
    });
  }

}
