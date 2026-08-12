<form action="http://10.10.31.50:8000/login" method="post">
    @csrf

    <input type="email" placeholder="Email adderess">
    <input type="password" placeholder="Password">

    <button type="submit" (click)="onLoginFormSubmit($event)">Login</button>
</form>