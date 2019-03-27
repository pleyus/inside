export class NewsAdapter {
  constructor(
    public Applicants: number = 0,
    public RadioMessages: number = 0,
    public Messages: number = 0,
    public Birthdays: Array<any> = [],
    public Feedbacks: number = 0,
    public ApplicantsTracking: Array<any> = [],
    public LoggedIn: boolean = false,
    public Polls: Array<any> = [],
    public Config: any = {}
  ) {}
}
