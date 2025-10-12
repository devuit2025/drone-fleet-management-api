// Users Table
Table users {
  id int [pk, increment]
  name varchar
  email varchar [unique]
  role varchar [note: "admin/operator/viewer"]
  created_at timestamp
  updated_at timestamp
}

// Pilots Table
Table pilots {
  id int [pk, increment]
  user_id int [ref: > users.id]
  name varchar
  status varchar [note: "active/inactive"]
  created_at timestamp
  updated_at timestamp
}

// Licenses Table (central for compliance)
Table licenses {
  id int [pk, increment]
  pilot_id int [ref: > pilots.id]
  license_number varchar [unique]
  license_type varchar [note: "commercial/recreational"]
  qualification_level varchar [note: "basic/advanced/etc."]
  issuing_authority varchar
  issued_date date
  expiry_date date
  active boolean [default: true]
  created_at timestamp
  updated_at timestamp
}

// Drone Management
Table drones {
  id int [pk, increment]
  name varchar
  model varchar
  serial_number varchar [unique]
  status varchar [note: "available/in_mission/maintenance"]
  max_payload numeric
  battery_capacity numeric
  last_maintenance date
  created_at timestamp
  updated_at timestamp
}

Table drone_configurations {
  id int [pk, increment]
  drone_id int [ref: > drones.id]
  firmware_version varchar
  flight_modes varchar[]
  sensor_types varchar[]
  created_at timestamp
}

// Missions and Waypoints
Table missions {
  id int [pk, increment]
  pilot_id int [ref: > pilots.id]
  license_id INT [ref: > licenses.id]
  mission_name varchar
  status varchar [note: "planned/in_progress/completed/failed"]
  start_time timestamp
  end_time timestamp
  created_at timestamp
  updated_at timestamp
}

Table waypoints {
  id int [pk, increment]
  mission_id int [ref: > missions.id]
  seq_number int
  geo_point geometry [note: "PostGIS Point SRID=4326"]
  altitude_m numeric
  speed_mps numeric
  action varchar
  created_at timestamp
}

// Telemetry
Table telemetry {
  id int [pk, increment]
  drone_id int [ref: > drones.id]
  mission_id int [ref: > missions.id]
  timestamp timestamp
  location geometry [note: "PostGIS Point SRID=4326"]
  altitude_m numeric
  speed_mps numeric
  battery_pct numeric
  status varchar
  payload_weight numeric
}

// Flight Safety & Compliance
Table no_fly_zones {
  id int [pk, increment]
  name varchar
  zone_type varchar [note: "polygon/circle"]
  geometry geometry [note: "PostGIS Polygon SRID=4326"]
  description text
}

Table flight_logs {
  id int [pk, increment]
  mission_id int [ref: > missions.id]
  event_type varchar
  description text
  timestamp timestamp
}

// Post-Flight Analytics
Table mission_reports {
  id int [pk, increment]
  mission_id int [ref: > missions.id]
  flight_time_sec int
  distance_m numeric
  avg_speed_mps numeric
  battery_consumed_pct numeric
  incident_count int
  created_at timestamp
}

// Simulation / Testing
Table simulations {
  id int [pk, increment]
  pilot_id int [ref: > pilots.id]
  mission_id int [ref: > missions.id]
  sim_start_time timestamp
  sim_end_time timestamp
  parameters jsonb
}
