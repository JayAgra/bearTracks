#![recursion_limit = "512"]
use webauthn_rs_proto::*;
use gloo::console;
use std::error::Error;
use std::fmt;
use wasm_bindgen::prelude::*;
use wasm_bindgen::JsCast;
use wasm_bindgen_futures::JsFuture;
use web_sys::{Document, Request, RequestInit, RequestMode, Response, Window};
use yew::prelude::*;

impl App {
    // login prompt
    fn view_login(&self, ctx: &Context<Self>) -> Html {
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
                        <input id="username" type="text"/><br/><br/>
                        <button
                            class="settingOpt std"
                            onclick={ ctx.link().callback(|e: MouseEvent| {
                                console::log!("prevent_default()");
                                e.prevent_default();
                                AppMsg::Authenticate
                            } ) }
                        ><p>{ "login" }</p></button>
                    </div>
                </div>
            </body>
          </>
        }
    }

    fn update_start_authenticate(&mut self, ctx: &Context<Self>) -> AppState {
        let username = get_value_from_element_id("username").unwrap_or_default();

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
                <meta http-equiv="refresh" content="2; url=/"/>
                <link rel="stylesheet" href="static/css/float.min.css" type="text/css"/>
                <link rel="stylesheet" href="static/css/settings.css" type="text/css"/>
            </head>
            <body class="gruvbox centerText">
                <div class="container">
                    <div class="dummy" style="min-width: 250px;">
                        <h1>{ "done!!! 🎉" }</h1>
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
                        <h1>{ "shit 💀" }</h1>
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

#[derive(Debug)]
enum AppState {
    Init,
    Waiting,
    Login,
    Success,
    Error(String),
}

#[derive(Debug)]
enum AppMsg {
    Authenticate,
    BeginAuthenticateChallenge(RequestChallengeResponse),
    AuthenticateSuccess,
    Error(String),
}

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
            (AppState::Init, AppMsg::Authenticate) => self.update_start_authenticate(ctx),
            (AppState::Waiting, AppMsg::BeginAuthenticateChallenge(rcr)) => {
                self.update_authenticate_challenge(ctx, rcr)
            }
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
            AppState::Init => self.view_login(ctx),
            AppState::Login => self.view_login(ctx),
            AppState::Waiting => self.view_waiting(ctx),
            AppState::Success => self.view_success(ctx),
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