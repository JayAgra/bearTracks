//
//  SystemStatusLiveActivity.swift
//  SystemStatus
//
//  Created by Jayen Agrawal on 2/27/24.
//

import ActivityKit
import SwiftUI
import WidgetKit

struct SystemStatusAttributes: ActivityAttributes {
  public struct ContentState: Codable, Hashable {
    var total_mem: Int
    var used_mem: Int
    var total_swap: Int
    var used_swap: Int
    var uptime: Int
    var load_one: Double
    var load_five: Double
    var load_fifteen: Double
    var sessions: Int
  }
  var hostname: String
}

struct SystemStatusLiveActivity: Widget {
  var body: some WidgetConfiguration {
    ActivityConfiguration(for: SystemStatusAttributes.self) { context in
      // Lock screen/banner UI goes here
      VStack {
        HStack {
          ProgressView(
            value: Float(context.state.used_mem) / Float(context.state.total_mem), total: 1.0
          ) {
            Text(
              "RAM\n\(Int(Float(context.state.used_mem) / Float(context.state.total_mem) * 100))%")
          }
          .progressViewStyle(
            CircularProgressViewStyle(
              tint: getColor(value: Float(context.state.used_mem) / Float(context.state.total_mem)))
          )
          Spacer()
          ProgressView(value: context.state.load_five, total: 1.0) {
            Text("CPU\n\(Int(context.state.load_five * 100))%")
          }
          .progressViewStyle(
            CircularProgressViewStyle(tint: getColor(value: Float(context.state.load_five))))
        }
        Text("\(context.state.sessions) active sessions")
      }
      .padding()
      .activityBackgroundTint(Color.black)
      .activitySystemActionForegroundColor(Color.white)

    } dynamicIsland: { context in
      DynamicIsland {
        DynamicIslandExpandedRegion(.leading) {
          ProgressView(
            value: Float(context.state.used_mem) / Float(context.state.total_mem), total: 1.0
          ) {
            Text(
              "RAM\n\(Int(100 * Float(context.state.used_mem) / Float(context.state.total_mem)))%")
          }
          .progressViewStyle(
            CircularProgressViewStyle(
              tint: getColor(value: Float(context.state.used_mem) / Float(context.state.total_mem)))
          )
        }
        DynamicIslandExpandedRegion(.trailing) {
          ProgressView(value: context.state.load_five, total: 1.0) {
            Text("CPU\n\(Int((context.state.load_five * 100).rounded()))%")
          }
          .progressViewStyle(
            CircularProgressViewStyle(tint: getColor(value: Float(context.state.load_five))))
        }
        DynamicIslandExpandedRegion(.bottom) {
          Text("\(context.state.sessions) active sessions")
        }
      } compactLeading: {
        ProgressView(
          value: Float(context.state.used_mem) / Float(context.state.total_mem), total: 1.0
        ) {
          Label("RAM", systemImage: "memorychip")
            .labelStyle(.iconOnly)
        }
        .progressViewStyle(
          CircularProgressViewStyle(
            tint: getColor(value: Float(context.state.used_mem) / Float(context.state.total_mem))))
      } compactTrailing: {
        ProgressView(value: context.state.load_five, total: 1.0) {
          Label("5m Load", systemImage: "gauge.open.with.lines.needle.33percent")
            .labelStyle(.iconOnly)
        }
        .progressViewStyle(
          CircularProgressViewStyle(tint: getColor(value: Float(context.state.load_five))))
      } minimal: {
        ProgressView(value: context.state.load_five, total: 1.0) {
          Label("5m Load", systemImage: "gauge.open.with.lines.needle.33percent")
            .labelStyle(.iconOnly)
        }
        .progressViewStyle(
          CircularProgressViewStyle(tint: getColor(value: Float(context.state.load_five))))
      }
      .widgetURL(URL(string: "https://beartracks.io"))
      .keylineTint(Color.red)
    }
  }

  private func getColor(value: Float) -> Color {
    if value > 0.9 {
      return Color.red
    } else if value > 0.8 {
      return Color.yellow
    } else {
      return Color.green
    }
  }
}

extension SystemStatusAttributes {
  fileprivate static var preview: SystemStatusAttributes {
    SystemStatusAttributes(hostname: "beartracks.io")
  }
}

extension SystemStatusAttributes.ContentState {
  fileprivate static var smiley: SystemStatusAttributes.ContentState {
    SystemStatusAttributes.ContentState.init(
      total_mem: 1000, used_mem: 839, total_swap: 0, used_swap: 0, uptime: 2_313_124,
      load_one: 0.02, load_five: 0.40, load_fifteen: 0.93, sessions: 2)
  }

  fileprivate static var starEyes: SystemStatusAttributes.ContentState {
    SystemStatusAttributes.ContentState.init(
      total_mem: 1000, used_mem: 839, total_swap: 100, used_swap: 0, uptime: 2_313_124,
      load_one: 0.02, load_five: 0.40, load_fifteen: 0.93, sessions: 2)
  }
}

#Preview("Notification", as: .content, using: SystemStatusAttributes.preview) {
  SystemStatusLiveActivity()
} contentStates: {
  SystemStatusAttributes.ContentState.smiley
  SystemStatusAttributes.ContentState.starEyes
}
