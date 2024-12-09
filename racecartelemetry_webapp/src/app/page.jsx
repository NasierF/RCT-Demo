"use client";
import { useState, useEffect } from "react";

import { CssBaseline, ThemeProvider, Typography, Stack, Button, Box, IconButton, Tooltip } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import Crop169Icon from "@mui/icons-material/Crop169";
import CropDinIcon from "@mui/icons-material/CropDin";

import NavBar from "@components/NavBar";

import DataWidgetList from "@components/DataWidgetList";

import DataGauge from "@components/DataGauge";
import TimeSeriesGraph from "@components/TimeSeriesGraph";
import XYGraph from "@components/XYGraph";
import LinearGauge from "@components/LinearGauge";

import ComponentEditor from "@components/ComponentEditor";
import { getCurrentConfig, fetchDataChannelsGroupedByCanID, } from "@/services/CANConfigurationService";

import { v4 as uuidv4 } from "uuid";

export default function Home() {
  const [rows, setRows] = useState([]);
  const [error, setError] = useState([]);
  const [rowHeights, setRowHeights] = useState([]);
  const [editorOpen, setEditorOpen] = useState(false);
  const [currentEdit, setCurrentEdit] = useState(null);
  const [groupedDataChannels, setGroupedDataChannels] = useState({});

  // Default configuration for initial graphs
  const defaultGraphs = [
    { type: "Gauge", id: uuidv4() },
    { type: "Linear Gauge", id: uuidv4() },
    { type: "Linear Gauge", id: uuidv4() },
    { type: "Time Series Graph", id: uuidv4() },
    { type: "XY Graph", id: uuidv4() },
  ];
  const defaultRows = [
    [defaultGraphs[0], defaultGraphs[1], defaultGraphs[2]],
    [defaultGraphs[3], defaultGraphs[4]],
  ];

  useEffect(() => {
    const fetchCanDataChannels = async () => {
      try {
        const currentConfig = await getCurrentConfig();
        if (currentConfig) {
          const data = await fetchDataChannelsGroupedByCanID(currentConfig);
          setGroupedDataChannels(data);
        }
      } catch (err) {
        console.error("Failed to fetch CAN data:", err);
      }
    };

    fetchCanDataChannels();
  }, []);

  useEffect(() => {
    const isInitialized = localStorage.getItem("dashboardInitialized");

    if (!isInitialized) {
      console.log("init")
      setRows(defaultRows);
      setRowHeights([450, 450]);

      // Save to local storage
      localStorage.setItem("dashboardRows", JSON.stringify(defaultRows));
      localStorage.setItem("dashboardRowHeights", JSON.stringify([450, 450]));
      localStorage.setItem("dashboardInitialized", "true");
      // Save individual graph configurations to local storage
      defaultGraphs.forEach((graph) =>
        localStorage.setItem(`${graph.type}-${graph.id}`, JSON.stringify(graph))
      );

    } else {
      // Load existing state from local storage
      const storedRows = JSON.parse(localStorage.getItem("dashboardRows"));
      const storedHeights = JSON.parse(localStorage.getItem("dashboardRowHeights"));

      setRows(storedRows);
      setRowHeights(storedHeights);
    }
  }, []);

  useEffect(() => {
    if (rows.length > 0) {
      localStorage.setItem("dashboardRows", JSON.stringify(rows));
      localStorage.setItem("dashboardRowHeights", JSON.stringify(rowHeights));
    }
  }, [rows, rowHeights]);

  const handleAddRow = () => {
    const input = prompt("Enter a number between 1 and 6 for placeholders:");
    const numPlaceholders = parseInt(input);

    if (isNaN(numPlaceholders) || numPlaceholders < 1 || numPlaceholders > 6) {
      setError("Invalid input. Please enter a number between 1 and 6.");
      return;
    }

    setError("");

    const newPlaceholders = Array(numPlaceholders)
      .fill(null)
      .map(() => ({ id: uuidv4(), type: null }));

    setRows([...rows, newPlaceholders]);
    setRowHeights([...rowHeights, 450]);
  };

  const adjustRowHeight = (rowIndex, increment) => {
    const updatedHeights = [...rowHeights];
    updatedHeights[rowIndex] = Math.max(
      250,
      Math.min(550, updatedHeights[rowIndex] + increment)
    );
    setRowHeights(updatedHeights);
  };

  const handleOpenEditor = (rowIndex, placeholderIndex) => {
    setCurrentEdit({ rowIndex, placeholderIndex });
    setEditorOpen(true);
  };

  const handleSaveComponent = (config) => {
    const { rowIndex, placeholderIndex } = currentEdit;

    const uniqueID = config.id || uuidv4();

    const updatedConfig = {
      ...config,
      id: uniqueID,
    };

    const updatedRows = [...rows];
    updatedRows[rowIndex] = [...updatedRows[rowIndex]];
    updatedRows[rowIndex][placeholderIndex] = { ...updatedConfig };

    setRows(updatedRows);

    const graphTypePrefix = config.type;
    localStorage.setItem(
      `${graphTypePrefix}-${updatedConfig.id}`,
      JSON.stringify(updatedConfig)
    );

    setEditorOpen(false);
    setCurrentEdit(null);
  };

  const handleRemovePlaceholder = (rowIndex, placeholderIndex) => {
    const updatedRows = [...rows];

    const placeholder = updatedRows[rowIndex][placeholderIndex];
    if (placeholder && placeholder.id) {
      const graphTypePrefix = placeholder.type;
      localStorage.removeItem(`${graphTypePrefix}-${placeholder.id}`);
    }

    updatedRows[rowIndex].splice(placeholderIndex, 1);
    setRows(updatedRows);
  };

  const handleRemoveRow = (rowIndex) => {
    const updatedRows = [...rows];
    const rowToRemove = updatedRows[rowIndex];

    if (rowToRemove) {
      rowToRemove.forEach((placeholder) => {
        if (placeholder && placeholder.id && placeholder.type) {
          const graphTypePrefix = placeholder.type;
          localStorage.removeItem(`${graphTypePrefix}-${placeholder.id}`);
        }
      });
    }

    updatedRows.splice(rowIndex, 1);
    setRows(updatedRows);

    const updatedHeights = [...rowHeights];
    updatedHeights.splice(rowIndex, 1);
    setRowHeights(updatedHeights);
  };

  const renderGraph = (config) => {
    if (!config.type) return null;

    // console.log("select: ", config.type)
    switch (config.type) {
      case "Gauge":
        return <DataGauge uniqueID={config.id} />;
      case "Linear Gauge":
        return <LinearGauge uniqueID={config.id} />;
      case "Time Series Graph":
        return <TimeSeriesGraph uniqueID={config.id} />;
      case "XY Graph":
        return <XYGraph uniqueID={config.id} />;
      default:
        return null;
    }
  };

  return (
    // <ThemeProvider theme={theme}>
    <>
      <CssBaseline />
      <NavBar />
      <Box
        sx={{
          backgroundColor: "black",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: 0.5,
        }}
      >
        <DataWidgetList />
      </Box>

      <Box
        sx={{
          backgroundColor: "black",
          minHeight: "100vh",
          padding: "20px",
          color: "white",
        }}
      >
        <Button
          variant="contained"
          color="primary"
          onClick={handleAddRow}
          sx={{ marginBottom: "10px" }}
        >
          Add Row
        </Button>
        {error && <Box sx={{ color: "red", marginBottom: "10px" }}>{error}</Box>}
        <Box>
          {rows.map((row, rowIndex) => (
            <Box
              key={rowIndex}
              sx={{
                display: "flex",
                alignItems: "center",
                marginBottom: "20px",
              }}
            >
              {/* Controls on the left */}
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  marginRight: "10px",
                }}
              >
                <Box
                  sx={{
                    backgroundColor: "rgba(140, 148, 140, 0.13)", // Shared grey background
                    borderRadius: "8px", // Optional: Add rounded corners
                    padding: "5px", // Add some spacing around the buttons
                    display: "flex",
                    flexDirection: "column", // Stack the buttons vertically
                    alignItems: "center",
                  }}
                >
                  <Tooltip title="Add Placeholder" placement="right">
                    <IconButton
                      color="primary"
                      onClick={() => {
                        const updatedRows = [...rows];
                        updatedRows[rowIndex].push({ id: uuidv4(), type: null });
                        setRows(updatedRows);
                      }}
                      sx={{
                        "&:hover": {
                          backgroundColor: "rgb(40,40,40)",
                        },
                      }}
                    >
                      <AddIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
                <Box
                  sx={{
                    backgroundColor: "rgba(120, 128, 120, 0.13)", // Shared grey background
                    borderRadius: "8px", // Optional: Add rounded corners
                    padding: "5px", // Add some spacing around the buttons
                    display: "flex",
                    flexDirection: "column", // Stack the buttons vertically
                    alignItems: "center",
                  }}
                >
                  <Tooltip title="Remove Row" placement="right">
                    <IconButton
                      color="secondary"
                      onClick={() => handleRemoveRow(rowIndex)}
                      sx={{
                        "&:hover": {
                          backgroundColor: "rgb(40,40,40)",
                        },
                      }}
                    >
                      <RemoveIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
                <Box
                  sx={{
                    backgroundColor: "rgba(120, 128, 120, 0.13)", // Shared grey background
                    borderRadius: "8px", // Optional: Add rounded corners
                    padding: "5px", // Add some spacing around the buttons
                    display: "flex",
                    flexDirection: "column", // Stack the buttons vertically
                    alignItems: "center",
                  }}
                >
                  <Tooltip title="Increase Row Height" placement="right">
                    <IconButton
                      color="primary"
                      onClick={() => adjustRowHeight(rowIndex, 50)}
                      sx={{
                        "&:hover": {
                          backgroundColor: "rgb(40,40,40)",
                        },
                      }}
                    >
                      <CropDinIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Decrease Row Height" placement="right">
                    <IconButton
                      color="primary"
                      onClick={() => adjustRowHeight(rowIndex, -50)}
                      sx={{
                        "&:hover": {
                          backgroundColor: "rgb(40,40,40)",
                        },
                      }}
                    >
                      <Crop169Icon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>

              {/* Placeholders */}
              <Box
                sx={{
                  display: "flex",
                  flexGrow: 1,
                  gap: "10px",
                  justifyContent: "space-between",
                  height: `${rowHeights[rowIndex]}px`, // Dynamically set height
                  width: "100%",
                }}
              >
                {row.map((placeholder, placeholderIndex) => (
                  <Box
                    key={placeholder.id}
                    sx={{
                      flex: 1,
                      height: "100%", // Match row height
                      border: "2px dashed gray",
                      position: "relative",
                    }}
                  >
                    {placeholder.type ? (
                      renderGraph(placeholder)
                    ) : (
                      // Render the add button for placeholders
                      <IconButton
                        sx={{
                          position: "absolute",
                          top: "50%",
                          left: "50%",
                          transform: "translate(-50%, -50%)",
                          color: "white",
                          "&:hover": {
                            backgroundColor: "rgb(40,40,40)",
                          },
                        }}
                        onClick={() =>
                          handleOpenEditor(rowIndex, placeholderIndex)
                        }
                      >
                        <AddIcon />
                      </IconButton>
                    )}
                    {/* Remove placeholder/component button */}
                    <IconButton
                      sx={{
                        position: "absolute",
                        top: "10px",
                        right: "10px",
                        color: "red",
                        "&:hover": {
                          backgroundColor: "rgb(40,40,40)",
                        },
                      }}
                      onClick={() =>
                        handleRemovePlaceholder(rowIndex, placeholderIndex)
                      }
                    >
                      <RemoveIcon />
                    </IconButton>
                  </Box>
                ))}
              </Box>
            </Box>
          ))}
        </Box>

        {/* Component Editor Modal */}
        {editorOpen && (
          <ComponentEditor
            open={editorOpen}
            groupedDataChannels={groupedDataChannels} // Pass CAN data
            onSave={(config) =>
              handleSaveComponent({ type: config.type, ...config })
            }
            onCancel={() => setEditorOpen(false)}
          />
        )}
      </Box>
    </>
  );
}
