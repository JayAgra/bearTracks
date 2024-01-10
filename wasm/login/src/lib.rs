// please don't read this code 😭

#![recursion_limit = "512"]
use std::error::Error;
use std::fmt;
use gloo::console;
use gloo_timers::callback::Timeout;
use wasm_bindgen::prelude::*;
use wasm_bindgen::JsCast;
use wasm_bindgen_futures::JsFuture;
use web_sys::{Document, Request, RequestInit, RequestMode, Response, Window};
use webauthn_rs_proto::*;
use yew::prelude::*;
use chrono::Days;

impl App {
    // login prompt
    fn view_login(self, ctx: &Context<Self>) -> Html {
        html! {
          <>
            <html lang="en">
                <head>
                    <meta charset="utf-8"/>
                    <title>{ "Login - bearTracks" }</title>
                    <meta name="robots" content="nositelinkssearchbox, nofollow"/>
                    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
                    <meta name="theme-color" content="#282828"/>
                    <link rel="stylesheet" href="static/css/float.min.css" type="text/css"/>
                    <link rel="stylesheet" href="static/css/login.min.css" type="text/css"/>
                </head>
                <body class="gruvbox centerText">
                    <div class="container">
                        <div class="dummy">
                            <h1 class="w3">{ "bearTracks"}<br/><span class="gametitle">{ "CRESCENDO" }</span></h1>
                            <form class="login">
                                <div id="currentUsername">
                                    <p class="unField">{ "welcome back to hell" }</p>
                                    <h2 class="unValue">{ "please log in" }</h2>
                                </div>
                                <h3 id="error" style="color: var(--cancelColor);"></h3>
                                <input id="username_input" type="text" autocomplete="username" placeholder="username" class="ci" name="username"/>
                                <input id="inputPassword" type="password" autocomplete="current-password" placeholder="password" name="password" class="ci" style="display: none;"/>
                                <div class="buttonCont">
                                    <button
                                        id="pw"
                                        class="uiButton actionButton nextButton submitButton"
                                        style="display: none;"
                                        type="button"
                                        disabled=true
                                        onclick={ ctx.link().callback(move |_e: MouseEvent| {
                                            let password_button = document().get_element_by_id("pw").unwrap();
                                            let _ = password_button.set_attribute("disabled", "true");
                                            let responses = format!(
                                                "{{\"username\": \"{}\", \"password\": \"{}\"}}",
                                                get_value_from_element_id("username_input").unwrap_or_default(),
                                                get_value_from_element_id("inputPassword").unwrap_or_default()
                                            );
                                            return AppMsg::PasswordAuthenticate(responses);
                                        } ) }
                                    ></button>
                                    <button 
                                        id="next"
                                        class="uiButton returnButton nextButton"
                                        type="button"
                                        onclick={ ctx.link().callback(move |e: MouseEvent| {
                                            e.prevent_default();
                                            let username_input = document().get_element_by_id("username_input").unwrap();
                                            let username_input_value_option = get_value_from_element_id("username_input");
                                            let username_indicator = document().get_element_by_id("currentUsername").unwrap();
                                            match self.state {
                                                AppState::Init => {
                                                    if username_input_value_option.is_some() {
                                                        let username_input_value = username_input_value_option.unwrap();
                                                        if username_input_value.len() != 0 as usize {
                                                            let password_login_button = document().get_element_by_id("pw").unwrap();
                                                            // fade username input
                                                            username_input.set_class_name("ci fade");
                                                            // set username display
                                                            username_indicator.first_child().unwrap().set_text_content(Some("username"));
                                                            username_indicator.last_child().unwrap().set_text_content(Some(username_input_value.as_str()));
                                                            // style next button to passkey button
                                                            document().get_element_by_id("next").unwrap().set_class_name("uiButton returnButton nextButton nextStepPk");
                                                            username_input.set_class_name("ci fade fadeIn");
                                                            // style password login button
                                                            let _ = password_login_button.set_attribute("style", "opacity: 0;");
                                                            password_login_button.set_class_name("uiButton actionButton nextButton submitButton nextStepPw");
                                                            // wait 100ms
                                                            let timeout = Timeout::new(100, move || {
                                                                let _ = username_input.set_attribute("style", "display: none;");
                                                                let _ = document().get_element_by_id("inputPassword").unwrap().set_attribute("style", "display: unset;");
                                                                let _ = password_login_button.remove_attribute("disabled");
                                                            });
                                                            timeout.forget();
                                                            return AppMsg::EnteredUsername;
                                                        }
                                                    }

                                                    username_input.set_class_name("ci shakeInput");
                                                    // stop for a second
                                                    let timeout = Timeout::new(1_000, move || {
                                                        username_input.set_class_name("ci");
                                                    });
                                                    timeout.forget();
                                                    AppMsg::EmptyUsername
                                                },
                                                AppState::AuthenticationMethod => {
                                                    AppMsg::PasskeyAuthenticate
                                                },
                                                _ => {
                                                    AppMsg::Error("invalid state".to_string())
                                                }
                                            }
                                        } ) }
                                    ></button>
                                </div>
                            </form><br/><br/>
                            <small style="text-align: center;" id="createAct" class="moveDown"><a href="create" class="actLink">{ "create account" }</a></small><br/>
                        </div>
                    </div>
                </body>
            </html>
          </>
        }
    }

    fn update_start_authenticate(&mut self, ctx: &Context<Self>) -> AppState {
        let username = get_value_from_element_id("username_input").unwrap_or_default();

        if username.is_empty() {
            return AppState::Error("a username must be provided".to_string());
        }

        ctx.link().send_future(async {
            match Self::authenticate_begin(username).await {
                Ok(v) => v,
                Err(v) => v.into(),
            }
        });
        AppState::Waiting
    }

    fn password_auth(&mut self, ctx: &Context<Self>, body: String) -> AppState {
        ctx.link().send_future(async {
            match Self::password_authenticate(body).await {
                Ok(msg) => msg,
                Err(msg) => msg.into()
            }
        });
        AppState::PasswordAuth
    }

    async fn password_authenticate(body: String) -> Result<AppMsg, FetchError> {
        let mut request_options: RequestInit = RequestInit::new();
        request_options.method("POST");
        request_options.body(Some(&JsValue::from(body)));
        request_options.mode(RequestMode::SameOrigin);

        let url = "/api/v1/auth/login";
        let request = Request::new_with_str_and_init(&url, &request_options)?;

        request
            .headers()
            .set("Content-Type", "application/json")?;

        let window: Window = web_sys::window().unwrap();
        let resp_value: JsValue = JsFuture::from(window.fetch_with_request(&request)).await?;
        let resp: Response = resp_value.dyn_into().unwrap();
        let resp_json = JsFuture::from(resp.text()?).await?.as_string().unwrap();

        let doc = web_sys::window().unwrap().document().unwrap().dyn_into::<web_sys::HtmlDocument>().unwrap();
        let mut ctime = chrono::offset::Utc::now();
        ctime = ctime.checked_add_days(Days::new(1)).unwrap();

        match resp_json.as_str() {
            "{\"status\": \"success\"}" => Ok(AppMsg::AuthenticateSuccess),
            "{\"status\": \"success_adm\"}" => {
                doc.set_cookie(format!("lead=true;expires={};path=/", ctime.to_string()).as_str()).unwrap();
                Ok(AppMsg::AuthenticateSuccess)
            },
            "{\"status\": \"success_ctl\"}" => {
                doc.set_cookie(format!("childTeamLead=true;expires={};path=/", ctime.to_string()).as_str()).unwrap();
                Ok(AppMsg::AuthenticateSuccess)
            },
            "{\"status\": \"bad\"}" => Ok(AppMsg::Error("bad password".to_string())),
            _ => Ok(AppMsg::Error("i done fucked up".to_string()))
        }
    }

    async fn authenticate_begin(username: String) -> Result<AppMsg, FetchError> {
        let mut request_options = RequestInit::new();
        request_options.method("POST");
        request_options.mode(RequestMode::SameOrigin);

        let url = format!("/api/v1/auth/passkey/auth_start/{username}");
        let request = Request::new_with_str_and_init(&url, &request_options)?;

        request
            .headers()
            .set("content-type", "application/json")
            .expect_throw("failed to set header");

        let window = window();
        let response = JsFuture::from(window.fetch_with_request(&request)).await?;
        let response_content: Response = response.dyn_into().unwrap_throw();
        let status = response_content.status();

        if status == 200 {
            let jsval = JsFuture::from(response_content.json()?).await?;
            let rcr: RequestChallengeResponse =
                serde_wasm_bindgen::from_value(jsval).unwrap_throw();
            Ok(AppMsg::BeginAuthenticateChallenge(rcr))
        } else {
            let text = JsFuture::from(response_content.text()?).await?;
            let emsg = text
                .as_string()
                .unwrap_or_else(|| "No message provided".to_string());
            Ok(AppMsg::Error(emsg))
        }
    }

    fn update_authenticate_challenge(&mut self, ctx: &Context<Self>, rcr: RequestChallengeResponse) -> AppState {
        let challenge_options: web_sys::CredentialRequestOptions = rcr.into();
        let promise = window()
            .navigator()
            .credentials()
            .get_with_options(&challenge_options)
            .expect_throw("Unable to create promise");
        let fut = JsFuture::from(promise);
        ctx.link().send_future(async move {
            match fut.await {
                Ok(jsval) => {
                    let w_rpkc = web_sys::PublicKeyCredential::from(jsval);
                    let pkc = PublicKeyCredential::from(w_rpkc);
                    match Self::authenticate_complete(pkc).await {
                        Ok(v) => v,
                        Err(v) => v.into(),
                    }
                }
                Err(e) => {
                    console::log!(format!("error -> {e:?}").as_str());
                    AppMsg::Error(format!("{e:?}"))
                }
            }
        });
        AppState::Waiting
    }

    async fn authenticate_complete(pkc: PublicKeyCredential) -> Result<AppMsg, FetchError> {
        console::log!(format!("pkc -> {pkc:?}").as_str());

        let req_jsvalue = serde_json::to_string(&pkc)
            .map(|s| JsValue::from(&s))
            .expect("failed to serialize");

        let mut request_options = RequestInit::new();
        request_options.method("POST");
        request_options.mode(RequestMode::SameOrigin);
        request_options.body(Some(&req_jsvalue));

        let request = Request::new_with_str_and_init("/api/v1/auth/passkey/auth_finish", &request_options)?;
        request
            .headers()
            .set("content-type", "application/json")
            .expect_throw("failed to set header");

        let window = window();
        let response = JsFuture::from(window.fetch_with_request(&request)).await?;
        let response_content: Response = response.dyn_into().unwrap_throw();
        let status = response_content.status();

        if status == 200 {
            Ok(AppMsg::AuthenticateSuccess)
        } else {
            let text = JsFuture::from(response_content.text()?).await?;
            let emsg = text.as_string().unwrap_or_default();
            Ok(AppMsg::Error(emsg))
        }
    }

    fn view_waiting(&self, _ctx: &Context<Self>) -> Html {
        html! {
          <>
            <head>
                <meta charset="utf-8"/>
                <title>{ "Passkey Login - bearTracks" }</title>
                <meta name="robots" content="nositelinkssearchbox, nofollow"/>
                <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
                <meta name="theme-color" content="#282828"/>
                <link rel="stylesheet" href="static/css/float.min.css" type="text/css"/>
                <link rel="stylesheet" href="static/css/settings.css" type="text/css"/>
            </head>
            <body class="gruvbox centerText">
                <div class="container">
                    <div class="dummy" style="min-width: 250px;">
                        <h1 class="w3">{ "bearTracks" }<br/><span class="gametitle">{ "passkey login" }</span></h1>
                        <button
                            class="settingOpt std"
                        ><p>{ ". . ." }</p></button>
                    </div>
                </div>
            </body>
          </>
        }
    }

    fn view_success(&self, _ctx: &Context<Self>) -> Html {
        html! {
          <>
            <head>
                <meta charset="utf-8"/>
                <title>{ "Passkey Login - bearTracks" }</title>
                <meta name="robots" content="nositelinkssearchbox, nofollow"/>
                <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
                <meta name="theme-color" content="#282828"/>
                <meta http-equiv="refresh" content="0; url=/"/>
                <link rel="stylesheet" href="static/css/float.min.css" type="text/css"/>
                <link rel="stylesheet" href="static/css/settings.css" type="text/css"/>
            </head>
            <body class="gruvbox centerText">
                <div class="container">
                    <div class="dummy" style="min-width: 250px;">
                        <h1>{ "..." }</h1>
                    </div>
                </div>
            </body>
          </>
        }
    }

    fn view_error(&self, _ctx: &Context<Self>, msg: &str) -> Html {
        html! {
          <>
            <head>
                <meta charset="utf-8"/>
                <title>{ "Passkey Login - bearTracks" }</title>
                <meta name="robots" content="nositelinkssearchbox, nofollow"/>
                <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
                <meta name="theme-color" content="#282828"/>
                <link rel="stylesheet" href="static/css/float.min.css" type="text/css"/>
                <link rel="stylesheet" href="static/css/settings.css" type="text/css"/>
                <script src="static/js/form/form.min.js"></script>
            </head>
            <body class="gruvbox centerText">
                <div class="container">
                    <div class="dummy" style="min-width: 250px;">
                        <h1>{ "error 💀💀💀" }</h1>
                        <p>{ msg }</p>
                    </div>
                </div>
            </body>
          </>
        }
    }
}

fn get_value_from_element_id(id: &str) -> Option<String> {
    document()
        .get_element_by_id(id)
        .and_then(|element| element.dyn_into::<web_sys::HtmlInputElement>().ok())
        .map(|element| element.value())
}

pub fn document() -> Document {
    window().document().expect("cant access document global")
}

pub fn window() -> Window {
    web_sys::window().expect("cant access window global")
}

#[derive(Debug, Clone)]
enum AppState {
    Init,
    AuthenticationMethod,
    Waiting,
    Success,
    PasswordAuth,
    Error(String),
}

#[derive(Debug)]
enum AppMsg {
    EmptyUsername,
    EnteredUsername,
    PasswordAuthenticate(String),
    PasskeyAuthenticate,
    BeginAuthenticateChallenge(RequestChallengeResponse),
    AuthenticateSuccess,
    Error(String),
}

#[derive(Debug, Clone)]
struct App {
    state: AppState,
}

impl Component for App {
    type Message = AppMsg;
    type Properties = ();

    fn create(_ctx: &Context<Self>) -> Self {
        App {
            state: AppState::Init,
        }
    }

    fn changed(&mut self, _ctx: &Context<Self>) -> bool {
        false
    }

    fn update(&mut self, ctx: &Context<Self>, msg: Self::Message) -> bool {
        let mut state_change = match (&self.state, msg) {
            (AppState::Init, AppMsg::EmptyUsername) => AppState::Init,
            (AppState::Init, AppMsg::EnteredUsername) => AppState::AuthenticationMethod,
            // use passkey at the AuthenticationMethod stage if selected
            (AppState::AuthenticationMethod, AppMsg::PasskeyAuthenticate) => self.update_start_authenticate(ctx),
            (AppState::AuthenticationMethod, AppMsg::PasswordAuthenticate(body)) => self.password_auth(ctx, body),
            // if user moved along, attempt authentication
            (AppState::Waiting, AppMsg::BeginAuthenticateChallenge(rcr)) => {
                self.update_authenticate_challenge(ctx, rcr)
            }
            (AppState::PasswordAuth, AppMsg::Error(s)) => AppState::Error(s),
            (AppState::PasswordAuth, AppMsg::AuthenticateSuccess) => AppState::Success,
            // successful passkey auth
            (AppState::Waiting, AppMsg::AuthenticateSuccess) => AppState::Success,
            (_, AppMsg::Error(msg)) => {
                console::log!(msg.as_str());
                AppState::Error(msg)
            }
            (s, m) => {
                let msg = format!("Invalid State Transition -> {s:?}, {m:?}");
                console::log!(msg.as_str());
                AppState::Error(msg)
            }
        };
        std::mem::swap(&mut self.state, &mut state_change);
        true
    }

    fn view(&self, ctx: &Context<Self>) -> Html {
        match &self.state {
            AppState::Init => self.clone().view_login(ctx),
            AppState::AuthenticationMethod => self.clone().view_login(ctx),
            AppState::Waiting => self.view_waiting(ctx),
            AppState::Success => self.view_success(ctx),
            AppState::PasswordAuth => self.view_waiting(ctx),
            AppState::Error(msg) => self.view_error(ctx, msg),
        }
    }

    fn rendered(&mut self, _ctx: &Context<Self>, _first_render: bool) {
        console::log!("oauth2::rendered");
    }
}

#[derive(Debug, Clone, PartialEq)]
pub struct FetchError {
    err: JsValue,
}

impl fmt::Display for FetchError {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        fmt::Debug::fmt(&self.err, f)
    }
}

impl Error for FetchError {}

impl From<JsValue> for FetchError {
    fn from(value: JsValue) -> Self {
        Self { err: value }
    }
}

impl FetchError {
    pub fn as_string(&self) -> String {
        self.err.as_string().unwrap_or_else(|| "null".to_string())
    }
}

impl From<FetchError> for AppMsg {
    fn from(fe: FetchError) -> Self {
        AppMsg::Error(fe.as_string())
    }
}

#[wasm_bindgen]
pub fn run_app() -> Result<(), JsValue> {
    yew::start_app::<App>();
    Ok(())
}