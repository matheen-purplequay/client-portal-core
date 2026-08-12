
interface ClientUser {
    id: number;
    first_name: string;
    middle_name: string;
    last_name: string;
    full_name: string;
    email: string;
    wm_client_id: number;
    wm_user_id: number;
  }
  
  class ClientUser {
    static defaultClientUser() {
      return {
        id: 0,
        first_name: "",
        middle_name: "",
        last_name: "",
        full_name: '',
        email: "",
        wm_client_id: 0,
        wm_user_id: 0
      } as ClientUser;
    }
  }