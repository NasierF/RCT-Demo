import React, { useEffect, useState } from "react";
import { Box, Typography, IconButton, Modal, Select, MenuItem } from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";
import ComponentEditor from "@/components/ComponentEditor";
import theme from "@/app/theme";
import { ref, onValue } from "firebase/database";
import { db } from "@firebaseConfig"; // Firebase config file
import { fetchConfigs, updateCurrentConfig } from "@services/CANConfigurationService";

const DataWidget = ({ canID, valueToDisplay, title, unit, isElapsedTime = false, isConnected }) => {
  const [number, setNumber] = useState(0);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [dataName, setDataName] = useState(title);
  const [color, setColor] = useState(`${theme.palette.primary.main}`);
  const [unitShown, setUnitShown] = useState(unit);
  const [configs, setConfigs] = useState([]);
  const [currentConfig, setCurrentConfig] = useState(null);
  const [loading, setLoading] = useState(true);


  const handleSettingsClick = () => {
    setSettingsVisible((prevState) => !prevState);
  };

  const handleSettingsClose = () => {
    setSettingsVisible(false);
  };

  const handleSave = (data) => {
    setColor(data["Color"]);
    setSettingsVisible(false);
  };

  useEffect(() => {
    const fetchAllConfigs = async () => {
      try {
        const data = await fetchConfigs();
        console.log("Raw configurations:", data);

        const filteredConfigs = data.filter((config) => config.id !== "currentConfig");
        console.log("Filtered configurations:", filteredConfigs);

        setConfigs(filteredConfigs);

        const currentConfigData = data.find((config) => config.id === "currentConfig");
        if (currentConfigData && currentConfigData.current) {
          setCurrentConfig(currentConfigData.current);
          console.log("Fetched current configuration:", currentConfigData.current);
        } else {
          setCurrentConfig(null);
          console.log("No current configuration set");
        }
      } catch (error) {
        console.error("Failed to fetch configurations:", error);
      } finally {
        setLoading(false);
      }
    };


    fetchAllConfigs();
  }, []);

  const handleConfigChange = async (configName) => {
    try {
      setCurrentConfig(configName);

      await updateCurrentConfig(configName);
    } catch (error) {
      console.error("Failed to update current configuration:", error);
    }
  };

  return (
    <>
      {settingsVisible && (
        <Modal
          open={settingsVisible}
          onClose={handleSettingsClose}
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <ComponentEditor
            config={{
              fields: [
                { label: "Color", type: "select", options: ["Blue", "Red", "Green"] },
              ],
            }}
            onCancel={handleSettingsClose}
            onSave={handleSave}
          />
        </Modal>
      )}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: color,
          color: "white",
          borderRadius: "16px",
          padding: "1rem",
          border: "1px solid",
          borderColor: "primary.light",
        }}
      >
        

        <Box sx={{ textAlign: "left", ml: 1 }}>
          <Typography sx={{ fontSize: "0.75rem", lineHeight: 1 }}>
            {dataName}
          </Typography>
          <Typography sx={{ fontSize: "1.5rem", fontWeight: "bold" }}>
            <Select
                value={currentConfig || ""}
                onChange={(e) => handleConfigChange(e.target.value)}
                displayEmpty
                sx={{
                    marginLeft: "0px",
                    backgroundColor: "white",
                    borderRadius: "4px",
                    padding: "0 8px",
                    fontSize: "0.9rem",
                    color: "black",
                    fontWeight: "500",
                    minWidth: "120px",
                    height: "32px",
                    }}
                    disabled={loading}
                    renderValue={(selected) => {
                        if (!selected) return "No configuration selected"; // Placeholder when no config is selected
                        const selectedConfig = configs.find((config) => config.id === selected);
                        return selectedConfig ? selectedConfig.id : "No configuration selected";
                    }}>
                {configs.map((config) => (
                <MenuItem key={config.id} value={config.id}>
                  {config.id}
                </MenuItem>
              ))}
            </Select>
          </Typography>
        </Box>
      </Box>
    </>
  );
};

export default DataWidget;
