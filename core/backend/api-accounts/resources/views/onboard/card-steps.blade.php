<div class="hstack gap-4 align-items-start">
    <div class="d-inline-block py-2 {{ ($currentStep == 1)? 'border-top border-2 border-color-primary color-primary' : 'border-top border-2' }}">
        <div class="h6 mb-0">Organization Setup</div>
        @if($currentStep == 1) <div class="small text-body-secondary opacity-75">Let's get it started</div> @endif
    </div>

    <div class="pt-2 small opacity-25">
        <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 320 512"><!--! Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path d="M310.6 233.4c12.5 12.5 12.5 32.8 0 45.3l-192 192c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L242.7 256 73.4 86.6c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l192 192z"/></svg>
    </div>

    <div class="d-inline-block py-2 {{ ($currentStep == 2)? 'border-top border-2 border-color-primary color-primary' : 'border-top border-2' }}">
        <div class="h6 mb-0">Users</div>
        @if($currentStep == 2) <div class="small text-body-secondary opacity-75">Let's add new users</div> @endif
    </div>

    <div class="pt-2 small opacity-25">
        <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 320 512"><!--! Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path d="M310.6 233.4c12.5 12.5 12.5 32.8 0 45.3l-192 192c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L242.7 256 73.4 86.6c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l192 192z"/></svg>
    </div>

    <div class="d-inline-block py-2 {{ ($currentStep == 3)? 'border-top border-2 border-color-primary color-primary' : 'border-top border-2' }}">
        <div class="h6 mb-0">Services</div>
        @if($currentStep == 3) <div class="small text-body-secondary opacity-75">Let's setup services</div> @endif
    </div>

    <div class="pt-2 small opacity-25">
        <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 320 512"><!--! Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path d="M310.6 233.4c12.5 12.5 12.5 32.8 0 45.3l-192 192c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L242.7 256 73.4 86.6c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l192 192z"/></svg>
    </div>

    <div class="d-inline-block py-2 {{ ($currentStep == 4)? 'border-top border-2 border-color-primary color-primary' : 'border-top border-2' }}">
        <div class="h6 mb-0">Apps</div>
        @if($currentStep == 4) <div class="small text-body-secondary opacity-75">Let's add apps</div> @endif
    </div>
</div>