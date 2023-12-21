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
    // render register page
    fn view_register(&self, ctx: &Context<Self>) -> Html {
        html! {
          <>
            <head>
                <meta charset="utf-8"/>
                <title>{ "Register Passkey - bearTracks" }</title>
                <meta name="robots" content="nositelinkssearchbox, nofollow"/>
                <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
                <meta name="theme-color" content="#282828"/>
                <link rel="stylesheet" href="static/css/float.min.css" type="text/css"/>
                <link rel="stylesheet" href="static/css/settings.css" type="text/css"/>
            </head>
            <body class="gruvbox centerText">
                <div class="container">
                    <div class="dummy" style="min-width: 250px;">
                        <h1 class="w3">{ "bearTracks" }<br/><span class="gametitle">{ "register passkey" }</span></h1>
                        <button
                            class="settingOpt std"
                            onclick={ ctx.link().callback(|e: MouseEvent| {
                                console::log!("prevent_default()");
                                e.prevent_default();
                                AppMsg::Register
                            } ) }
                        ><p>{ "register passkey" }</p></button>
                    </div>
                </div>
            </body>
          </>
        }
    }

    // get challenge
    fn update_start_register(&mut self, ctx: &Context<Self>) -> AppState {
        ctx.link().send_future(async {
            match Self::register_begin().await {
                Ok(v) => v,
                Err(v) => v.into(),
            }
        });
        AppState::Waiting
    }

    // loading screen
    fn view_waiting(&self, _ctx: &Context<Self>) -> Html {
        html! {
          <>
            <head>
                <meta charset="utf-8"/>
                <title>{ "Register Passkey - bearTracks" }</title>
                <meta name="robots" content="nositelinkssearchbox, nofollow"/>
                <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
                <meta name="theme-color" content="#282828"/>
                <link rel="stylesheet" href="static/css/float.min.css" type="text/css"/>
                <link rel="stylesheet" href="static/css/settings.css" type="text/css"/>
            </head>
            <body class="gruvbox centerText">
                <div class="container">
                    <div class="dummy" style="min-width: 250px;">
                        <h1 class="w3">{ "bearTracks" }<br/><span class="gametitle">{ "register passkey" }</span></h1>
                        <button
                            class="settingOpt std"
                        ><p>{ ". . ." }</p></button>
                    </div>
                </div>
            </body>
          </>
        }
    }

    // send registration request
    async fn register_begin() -> Result<AppMsg, FetchError> {
        let mut request_options = RequestInit::new();
        request_options.method("POST");
        request_options.mode(RequestMode::SameOrigin);

        let url = ("/api/v1/auth/passkey/register_start").to_string();
        let request = Request::new_with_str_and_init(&url, &request_options)?;

        request
            .headers()
            .set("content-type", "application/json")
            .expect_throw("failed to set header");

        let window = window();
        let resp_value = JsFuture::from(window.fetch_with_request(&request)).await?;
        let resp: Response = resp_value.dyn_into().unwrap_throw();
        let status = resp.status();

        if status == 200 {
            let jsval = JsFuture::from(resp.json()?).await?;
            let ccr: CreationChallengeResponse =
                serde_wasm_bindgen::from_value(jsval).unwrap_throw();
            Ok(AppMsg::BeginRegisterChallenge(ccr))
        } else {
            let text = JsFuture::from(resp.text()?).await?;
            let emsg = text
                .as_string()
                .unwrap_or_else(|| "no message provided".to_string());
            Ok(AppMsg::Error(emsg))
        }
    }


    // got challenge
    fn update_register_challenge(&mut self, ctx: &Context<Self>, ccr: CreationChallengeResponse) -> AppState {
        let challenge_options: web_sys::CredentialCreationOptions = ccr.into();
        let promise = window()
            .navigator()
            .credentials()
            .create_with_options(&challenge_options)
            .expect_throw("unable to create promise");
        let fut = JsFuture::from(promise);

        ctx.link().send_future(async move {
            match fut.await {
                Ok(jsval) => {
                    let w_rpkc = web_sys::PublicKeyCredential::from(jsval);
                    let rpkc = RegisterPublicKeyCredential::from(w_rpkc);
                    match Self::register_complete(rpkc).await {
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

    // send signed object back
    async fn register_complete(rpkc: RegisterPublicKeyCredential) -> Result<AppMsg, FetchError> {
        console::log!(format!("rpkc -> {rpkc:?}").as_str());

        let req_jsvalue = serde_json::to_string(&rpkc)
            .map(|s| JsValue::from(&s))
            .expect("Failed to serialise rpkc");

        let mut request_options = RequestInit::new();
        request_options.method("POST");
        request_options.mode(RequestMode::SameOrigin);
        request_options.body(Some(&req_jsvalue));

        let request = Request::new_with_str_and_init("/api/v1/auth/passkey/register_finish", &request_options)?;
        request
            .headers()
            .set("content-type", "application/json")
            .expect_throw("failed to set header");

        let window = window();
        let create_response = JsFuture::from(window.fetch_with_request(&request)).await?;
        let response_content: Response = create_response.dyn_into().unwrap_throw();
        let status = response_content.status();

        if status == 200 {
            Ok(AppMsg::RegisterSuccess)
        } else {
            let text = JsFuture::from(response_content.text()?).await?;
            let error_message = text.as_string().unwrap_or_default();
            Ok(AppMsg::Error(error_message))
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

    fn view_success(&self, _ctx: &Context<Self>) -> Html {
        html! {
          <>
            <head>
                <meta charset="utf-8"/>
                <title>{ "Passkey Login - bearTracks" }</title>
                <meta name="robots" content="nositelinkssearchbox, nofollow"/>
                <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
                <meta name="theme-color" content="#282828"/>
                <meta http-equiv="refresh" content="1; url=/"/>
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
    Success,
    Error(String),
}

#[derive(Debug)]
enum AppMsg {
    Register,
    BeginRegisterChallenge(CreationChallengeResponse),
    RegisterSuccess,
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
            (AppState::Init, AppMsg::Register) => self.update_start_register(ctx),
            (AppState::Waiting, AppMsg::BeginRegisterChallenge(ccr)) => {
                self.update_register_challenge(ctx, ccr)
            }
            (AppState::Waiting, AppMsg::RegisterSuccess) => AppState::Success,
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
            AppState::Init => self.view_register(ctx),
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