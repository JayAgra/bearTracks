use std::fs::File;
use std::env;
use a2::{Client, DefaultNotificationBuilder, Endpoint, NotificationBuilder, NotificationOptions};
use log::{error, info};
use std::error::Error;

pub async fn send_notification(client: &Client, device_token: &str) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
    let topic = Some(env::var("APN_BUNDLE_ID").expect("APN_BUNDLE_ID is not set"));

    let options = NotificationOptions {
        apns_topic: topic.as_deref(),
        ..Default::default()
    };
    
    let message = "Message from Rust!"; // Notification message

    // Notification payload
    let builder = DefaultNotificationBuilder::new()
        .set_body(message.as_ref())
        .set_sound("default")
        .set_badge(1u32);

    let payload = builder.build(device_token.as_ref(), options);
    
    match client.send(payload).await {
        Ok(response) => {
            info!("Sent: {:?}", response);
            Ok(())
        }
        Err(e) => {
            error!("Failed to send notification: {}", e);
            Err(e.into())
        }
    }
}

pub fn setup_client() -> Result<Client, Box<dyn Error>> {
    const KEY_FILE: &str = "./keys/AuthKey-apn.p8";

    let key_id = env::var("APN_KEY_ID").expect("APN_KEY_ID is not set");
    let team_id = env::var("APN_TEAM_ID").expect("APN_TEAM_ID is not set");
    
    let endpoint = Endpoint::Sandbox; // APNs environment 

    let private_key = match File::open(KEY_FILE) {
        Ok(file) => file,
        Err(e) => {
            error!("Failed to open key file: {}", e);
            return Err(e.into())
        }
    };

    info!("Key file: {:?}", private_key);
    info!("Key id: {}", key_id);
    info!("Team id: {}", team_id);

    match Client::token(private_key, &key_id, &team_id, endpoint) {
        Ok(client) => Ok(client),
        Err(e) => {
            error!("Failed to create client: {}", e);
            Err(e.into())
        }
    }
}
