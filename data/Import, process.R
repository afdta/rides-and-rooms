library("jsonlite")

dat <- read.csv("~/Projects/Brookings/gig-economy/data/gig economy exported appendix table.csv", stringsAsFactors=FALSE, na.strings=c("NA","","--"))

j <- toJSON(dat, digits=5)

jj <- c("var data =", j, ";", "export default data;")

writeLines(jj, "~/Projects/Brookings/gig-economy/js/modules/data.js")
