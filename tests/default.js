describe("virt test", function() {
	var as = new AS(),
			closedId = as.app.prefs.get('extensions.as.lastClosedId'), 
			time = new Date();
	closedid.value = time;
	closedId = as.app.prefs.get('extensions.as.lastClosedId')
		
  it("contains spec with an expectation", function() {
    expect(closedId).toEqual(time);
  });
});

