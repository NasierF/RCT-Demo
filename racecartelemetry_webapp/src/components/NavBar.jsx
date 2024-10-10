import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Link from "next/link";
import { red } from "@mui/material/colors";

const Navbar = () => {
/* uncomment whenever login part needs to be created
  const handleLogout = () => {
    alert("You have been logged out!");
    // replacee
  };
*/
  return (
    <AppBar position="static" sx={{ marginBottom: 5 }}>
      <Toolbar
        sx={{ background: "linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)" }}
      >
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Temple Formula Racing
          </Typography>
        </Box>

        <Link href="/" passHref>
          <Button color="white">Dashboard</Button>
        </Link>

        <Link href="/ComponentEditor" passHref>
          <Button color="white">Component Editor</Button>
        </Link>

        <Link href="/CANDataAssignment" passHref>
          <Button color="white">Data Assignment</Button>
        </Link>

        <Link href="/CANInput" passHref>
          <Button color="white">CAN Input</Button>
        </Link>

        {/* <Button sx={{ color: "white", border: 2 }} onClick={handleLogout}>
          Logout
        </Button> */}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
